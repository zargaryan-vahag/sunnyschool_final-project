const multer = require('multer');
const mimeType = require('mime-types');
const path = require('path');

const uploadPath = path.join(__homedir, './public/uploads');

const storage = multer.diskStorage({
  destination (req, file, cb) {
    cb(null, uploadPath)
  },
  filename (req, file, cb) {
    const arr = file.originalname.split('.');
    const extension = arr[arr.length - 1];
    cb(null, Date.now().toString() + '_' + Math.round(Math.random() * 10E9) + '.' + extension);
  }
});

module.exports = multer({ storage: storage });
