const Book = require('../models/Book');
const fs = require('fs');

exports.createBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);
  delete bookObject._id;
  delete bookObject._userId;
  const book = new Book({
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
    averageRating: 0,
    ratings: [],
    ...bookObject,
  });
  book
    .save()
    .then(() => res.status(201).json({message: 'Objet enregistré !'}))
    .catch(error => res.status(400).json({error}));
};

exports.modifyBook = (req, res, next) => {
  const bookObject = req.file
    ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
      }
    : {...req.body};

  delete bookObject._userId;
  Book.findOne({_id: req.params.id})
    .then(book => {
      if (book.userId != req.auth.userId) {
        res.status(403).json({message: 'unauthorized request'});
      } else {
        Book.updateOne({_id: req.params.id}, {...bookObject, _id: req.params.id})
          .then(() => res.status(200).json({message: 'Objet modifié!'}))
          .catch(error => res.status(401).json({error}));
      }
    })
    .catch(error => {
      res.status(400).json({error});
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
    .then(updatedBook => { res.status(200).json(updatedBook)})
    .catch(error => {res.status(400).json({error})});
};


exports.getBestBooks = (req, res, next) => {
  Book.find()
    .sort({ averageRating: -1 })
    .limit(3)
    .then(books => {
      res.status(200).json(books);
    })
    .catch(error => {
      console.error('Erreur lors de la récupération des livres les mieux notés :', error); 
      res.status(500).json({ error, message: 'Erreur lors de la récupération des livres les mieux notés.' });
    });
};

