const sharp = require('sharp');
const path = require('path');

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

const reziseImage = (req, res, next) => {
  if (!req.file) {
    return next();
    //return res.status(400).json({error: 'NO_IMAGE'});
  }

  const {buffer} = req.file;

  sharp(buffer)
    .resize(206, 260, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .jpeg({quality: 80})
    .webp({quality: 80})

    .toBuffer()
    .then(data => {
      req.file.buffer = data;
      next();
    })
    .catch(error => res.status(500).json({error}));
};

module.exports = reziseImage;
