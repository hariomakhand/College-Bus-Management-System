const multer = require('multer');
const path = require('path');

// Configure multer for memory storage (for Cloudinary upload)
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req, file, cb) => {
  // Check file type
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only images and documents are allowed!'), false);
  }
};

// Multer configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: fileFilter,
});

// Different upload configurations
const uploadSingle = upload.single('file');
const uploadMultiple = upload.array('files', 5);
const uploadFields = upload.fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'documents', maxCount: 3 }
]);

module.exports = {
  upload,
  uploadSingle,
  uploadMultiple,
  uploadFields
};