//const jimp = require('jimp');

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

const reziseImage = (req, res, next) => {
    console.log(req.file.path);
};

module.exports = reziseImage;