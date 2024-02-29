/*const { body, validationResult } = require('express-validator');

const validateBook = [
  body('title').notEmpty().isString(),
  body('author').notEmpty().isString(),
  body('year').notEmpty().isInt(),
  body('genre').notEmpty().isString(),
  (req, res, next) => {
    if (!req.body || !req.body.book) {
        return res.status(400).json({ error: 'Invalid request body' });
    }
    const bookValidation = validationResult(req);
    if (bookValidation.isEmpty()) {
        return res.status(422).json({ errors: bookValidation.array() });
  }
  next()
  },
];

module.exports = validateBook;*/