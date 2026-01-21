const express = require('express');
const { uploadSingle, uploadMultiple } = require('../config/multer');
const {
  uploadSingleFile,
  uploadMultipleFiles,
  uploadProfileImage,
  deleteFile
} = require('../controllers/UploadController');
const AuthProtect = require('../middlewares/AuthProtect');

const router = express.Router();

// Upload single file
router.post('/single', AuthProtect, uploadSingle, uploadSingleFile);

// Upload multiple files
router.post('/multiple', AuthProtect, uploadMultiple, uploadMultipleFiles);

// Upload profile image
router.post('/profile', AuthProtect, uploadSingle, uploadProfileImage);

// Delete file
router.delete('/:publicId', AuthProtect, deleteFile);

module.exports = router;