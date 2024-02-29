const sharp = require('sharp');
const path = require('path');

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

const reziseImage =   (req, res, next) => {
   sharp(req.file.path)
   .resize(206, 260, {
    fit: 'inside',
    withoutEnlargement: true,
  })
    .jpeg({ quality: 60 })
    .webp({ quality: 60 })
    .toFile(path.join('images', req.file.filename))
    next()
} 

module.exports = reziseImage;