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
  console.log('Received userRating:', userRating);
  // Vérifiez que la note est entre 0 et 5
  if (userRating.rating < 0 || userRating.rating > 5) {
    return res.status(400).json({error: 'La note doit être comprise entre 0 et 5.'});
  }

  bookId = req.params.id;
  console.log('bookId:', bookId);

  Book.findById(bookId)
    .then(book => {
      console.log('book.ratings:', book.ratings);
      console.log('book.userId', book.userId);
      console.log('book.ratings.grade', book.ratings[0].grade);

      const userRatingIndex = book.ratings.findIndex(item => item.userId === req.auth.userId);
      console.log('userRatingIndex', userRatingIndex);

      if (userRatingIndex !== -1) {
        return res.status(400).json({error: 'Vous avez déjà noté ce livre.'});
      }

      console.log('Received rating:', userRating.rating);
      console.log('Received userId:', userRating.userId);

      book.ratings.push({userId: userRating.userId, grade: userRating.rating});

      // Mettez à jour la note moyenne "averageRating"
      console.log('book.ratings after push:', book.ratings);
      console.log('book.ratings.length after push:', book.ratings);
      console.log('averageRating before update:', book.averageRating);

      if (book.ratings.length > 0) {
        const totalRating = book.ratings.reduce((acc, curr) => acc + curr.grade, 0);
        console.log('total rating:', totalRating);
        book.averageRating = totalRating / book.ratings.length;
      }

      console.log('averageRating after update:', book.averageRating);

      // Sauvegardez les modifications
      return book.save();
    })
    .then(updatedBook => { res.status(200).json(updatedBook)})
    .catch(error => {res.status(400).json({error})});
};

/*// Middleware pour définir la note d'un livre
exports.rateBook = (req, res, next) => {
  const userRating = req.body;
  console.log('Received userRating:', userRating);
  console.log('Received rating:', userRating.rating);
  const bookId = req.params.id;

  // Vérifiez que la note est entre 0 et 5
  if (userRating.rating < 0 || userRating.rating > 5) {
    return res.status(400).json({error: 'La note doit être comprise entre 0 et 5.'});
  }

  // Recherchez le livre par son ID
  Book.findById(bookId)
    .then(book => {
      if (!book) {
        res.status(404).json({error: 'Livre non trouvé.'});
      }

      // Vérifiez si l'utilisateur a déjà noté ce livre
      const userRatingIndex = book.ratings.findIndex(item => item.userId === req.auth.userId);
      console.log('userRatingIndex', userRatingIndex);
      if (userRatingIndex !== -1) {
        res.status(400).json({error: 'Vous avez déjà noté ce livre.'});
      }

      // Ajoutez la note au tableau "ratings"
      book.ratings.push({userId: req.auth.userId, rating});

      // Mettez à jour la note moyenne "averageRating"
      if (book.ratings.length > 0) {
        const totalRating = book.ratings.reduce((acc, curr) => acc + curr.rating, 0);
        console.log('Current rating:', curr.rating);
        book.averageRating = totalRating / book.ratings.length;
      } else {
        // Si le tableau de notes est vide, mettez la moyenne à 0
        book.averageRating = 0;
      }

      // Sauvegardez les modifications
      book.save();
    })
    .then(updatedBook => {
      // Renvoyez le livre mis à jour
      res.status(200).json({message: 'Note définie avec succès.', book: updatedBook});
    })
    .catch(error => {
      res.status(500).json({error: 'Erreur lors de la définition de la note.'});
    });
};

// Middleware pour récupérer les 3 livres avec la meilleure note moyenne
exports.getBestBooks = (req, res, next) => {
  // Récupérez les 3 livres avec la meilleure note moyenne
  Book.find()
    .sort({averageRating: -1})
    .limit(3)
    .then(bestRatedBooks => {
      res.status(200).json({bestRatedBooks});
    })
    .catch(error => {
      res.status(500).json({error: 'Erreur lors de la récupération des livres les mieux notés.'});
    });
};*/
