const sharp = require('sharp');
const path = require('path');

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

const reziseImage =   (req, res, next) => {
   console.log('req.file : ',req.file);
   console.log('req.file.path : ',req.file.path);
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




/*module.exports = reziseImage;
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
    });*/