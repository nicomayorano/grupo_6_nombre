/* eslint-disable eqeqeq */
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = path.join(process.cwd(), 'src', 'public', 'productsImages');
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const fileName = `${Date.now()}-${file.originalname}`;
    cb(null, fileName);
  },
});

const upload = multer({
  storage,
  fileFilter(req, file, cb) {
    if (file.mimetype == 'image/jpg' || file.mimetype == 'image/jpeg' || file.mimetype == 'image/webp' || file.mimetype == 'image/bmp' || file.mimetype == 'image/png') {
      cb(null, true);
    } else {
      cb(null, false);
      cb(new Error('FORBIDDEN_FILE_EXT'));
    }
  },
  limits: {
    fileSize: 500_000, // 500KB
    files: 6,
  },
}).array('image', 6);

module.exports = upload;
