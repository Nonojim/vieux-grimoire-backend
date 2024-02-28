//const jimp = require('jimp');
const path = require('path');

  
  const logImage = (req, res, next) => {
      console.log(req.file.path);
  };
  
  module.exports = logImage;