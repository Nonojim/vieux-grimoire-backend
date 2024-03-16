const Book = require('../models/Book');
const fs = require('fs');
const uuid = require('uuid');

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

exports.createBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);
  if (
    !(
      bookObject.title &&
      Array.isArray(bookObject.ratings) &&
      bookObject.ratings.length === 1 &&
      bookObject.ratings[0].userId &&
      bookObject.ratings[0].grade &&
      bookObject.author &&
      bookObject.year &&
      !isNaN(bookObject.year) &&
      bookObject.averageRating &&
      bookObject.genre
    )
  ) {
    return res.status(400).json({error: 'BAD_REQUEST'});
  }
  delete bookObject._id;
  delete bookObject._userId;
  const filename = uuid.v4() + '.' + MIME_TYPES[req.file.mimetype];
  const book = new Book({
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${filename}`,
    averageRating: 0,
    ratings: [],
    ...bookObject,
  });
  book
    .save()
    .then(() => {
      fs.writeFile(`images/${filename}`, req.file.buffer, err => {
        if (err) {
          console.error(err);
        } else {
          console.log('Le fichier a été écrit avec succès dans le dossier images.');
        }
      });
      return res.status(201).json({message: 'Objet enregistré !'});
    })
    .catch(error => res.status(500).json({error}));
};

exports.modifyBook = (req, res, next) => {
  const bookId = req.params.id;
  const userId = req.auth.userId;
  const newFilename = req.file ? uuid.v4() + '.' + MIME_TYPES[req.file.mimetype] : null;

  let bookData = JSON.parse(req.body.book);
  delete bookData._userId;

  Book.findById(bookId)
    .then(book => {
      if (!book) {
        return res.status(404).json({message: 'Livre non trouvé'});
      }

      if (book.userId.toString() !== userId) {
        return res.status(403).json({message: 'Demande non autorisée'});
      }

      let imageUrl = book.imageUrl;

      if (req.file) {
        imageUrl = `${req.protocol}://${req.get('host')}/images/${newFilename}`;

        if (book.imageUrl && book.imageUrl !== imageUrl) {
          const oldFilename = book.imageUrl.split('/').pop();
          fs.unlink(`images/${oldFilename}`, err => {
            if (err) {
              console.error("Erreur lors de la suppression de l'ancienne image :", err);
            }
          });
        }
      }

      const updatedBookData = {
        ...bookData,
        _id: bookId,
        userId: userId,
        imageUrl: imageUrl,
      };

      return Book.updateOne({_id: bookId}, updatedBookData);
    })
    .then(() => {
      if (newFilename) {
        fs.writeFile(`images/${newFilename}`, req.file.buffer, err => {
          if (err) {
            console.error("Erreur lors de l'écriture du fichier :", err);
          } else {
            console.log('Le fichier a été écrit avec succès dans le dossier images.');
          }
        });
      }
      res.status(200).json({message: 'Livre modifié avec succès'});
    })
    .catch(error => {
      console.error('Erreur lors de la modification du livre :', error);
      res.status(500).json({error: 'Erreur lors de la modification du livre'});
    });
};

exports.deleteBook = (req, res, next) => {
  Book.findOne({_id: req.params.id})
    .then(book => {
      if (book.userId != req.auth.userId) {
        res.status(403).json({message: 'unauthorized request'});
      } else {
        const filename = book.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, () => {
          Book.deleteOne({_id: req.params.id})
            .then(() => {
              res.status(200).json({message: 'Objet supprimé !'});
            })
            .catch(error => res.status(401).json({error}));
        });
      }
    })
    .catch(error => {
      res.status(500).json({error});
    });
};

exports.getOneBook = (req, res, next) => {
  Book.findOne({_id: req.params.id})
    .then(book => res.status(200).json(book))
    .catch(error => res.status(400).json({error}));
};

exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({error}));
};

exports.rateBook = (req, res, next) => {
  userRating = req.body;
  if (userRating.rating < 0 || userRating.rating > 5) {
    return res.status(400).json({error: 'La note doit être comprise entre 0 et 5.'});
  }

  bookId = req.params.id;

  Book.findById(bookId)
    .then(book => {
      const userRatingIndex = book.ratings.findIndex(item => item.userId === req.auth.userId);

      if (userRatingIndex !== -1) {
        return res.status(400).json({error: 'Vous avez déjà noté ce livre.'});
      }

      book.ratings.push({userId: userRating.userId, grade: userRating.rating});

      if (book.ratings.length > 0) {
        const totalRating = book.ratings.reduce((acc, curr) => acc + curr.grade, 0);
        book.averageRating = totalRating / book.ratings.length;
      }

      return book.save();
    })
    .then(updatedBook => {
      res.status(200).json(updatedBook);
    })
    .catch(error => {
      res.status(400).json({error});
    });
};

exports.getBestBooks = (req, res, next) => {
  Book.find()
    .sort({averageRating: -1})
    .limit(3)
    .then(books => {
      res.status(200).json(books);
    })
    .catch(error => {
      console.error('Erreur lors de la récupération des livres les mieux notés :', error);
      res
        .status(500)
        .json({error, message: 'Erreur lors de la récupération des livres les mieux notés.'});
    });
};
