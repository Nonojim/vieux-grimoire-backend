const sharp = require('sharp');

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

const resizeImage = (req, res, next) => {
  console.log('Sharp Config - Input Path:', req.file.path);  // Ajouter ce log

  sharp(req.file.path)
    .resize({ width: 206, height: 260 })
    .jpeg({ quality: 60 })
    .webp({ quality: 60 })
    .toFormat(MIME_TYPES[req.file.mimetype])
    .toFile('images/' + req.file.filename, (err, info) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Erreur lors du redimensionnement de l\'image');
      }

      console.log(info);

      next();
    });
};

module.exports = resizeImage;

/*module.exports = reziseImage;

const reziseImage = (req, res, next) => {
  console.log(req.file.path);
  sharp(req.file.path)
    .resize({ width: 206, height: 260 })
    .jpeg({ quality: 60 })
    .webp({ quality: 60 })
    
}*/