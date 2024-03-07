const express = require('express');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');
const sharp = require('../middleware/sharp-config');
const router = express.Router();

const booksCtrl = require('../controllers/books');

router.get('/bestrating', booksCtrl.getBestBooks);
router.post('/', auth, multer, sharp, booksCtrl.createBook);
router.get('/', booksCtrl.getAllBooks);
router.put('/:id', auth, multer, sharp, booksCtrl.modifyBook);
router.delete('/:id', auth, booksCtrl.deleteBook);
router.get('/:id', booksCtrl.getOneBook);
router.post('/:id/rating', auth, booksCtrl.rateBook);

module.exports = router;
