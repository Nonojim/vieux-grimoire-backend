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
    return res.status(400).json({error: 'NO_IMAGE'});
  }
  console.log('req.filesharp', req.file, 'req.bodyctrl', req.body);
  const {buffer, originalname} = req.file;
  console.log('original name :', originalname);
  console.log(req.body);
  console.log('REQ FILE', req.file);
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
