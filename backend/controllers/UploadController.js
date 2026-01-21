const { uploadToCloudinary, uploadMultipleToCloudinary, deleteFromCloudinary } = require('../utils/uploadUtils');

// Upload single file
const uploadSingleFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { folder = 'bus-management' } = req.body;

    const result = await uploadToCloudinary(req.file.buffer, {
      folder: folder,
      resource_type: 'auto'
    });

    res.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        size: result.bytes
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'File upload failed',
      error: error.message
    });
  }
};

// Upload multiple files
const uploadMultipleFiles = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const { folder = 'bus-management' } = req.body;

    const results = await uploadMultipleToCloudinary(req.files, {
      folder: folder,
      resource_type: 'auto'
    });

    const uploadedFiles = results.map(result => ({
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      size: result.bytes
    }));

    res.json({
      success: true,
      message: 'Files uploaded successfully',
      data: uploadedFiles
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Files upload failed',
      error: error.message
    });
  }
};

// Upload profile image
const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image uploaded'
      });
    }

    const { userId, userType = 'user' } = req.body;

    const result = await uploadToCloudinary(req.file.buffer, {
      folder: `bus-management/profiles/${userType}`,
      public_id: `${userType}_${userId}_${Date.now()}`,
      transformation: [
        { width: 300, height: 300, crop: 'fill' },
        { quality: 'auto', fetch_format: 'auto' }
      ]
    });

    res.json({
      success: true,
      message: 'Profile image uploaded successfully',
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        thumbnailUrl: result.secure_url.replace('/upload/', '/upload/w_150,h_150,c_fill/')
      }
    });
  } catch (error) {
    console.error('Profile upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Profile image upload failed',
      error: error.message
    });
  }
};

// Delete file
const deleteFile = async (req, res) => {
  try {
    const { publicId } = req.params;

    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: 'Public ID is required'
      });
    }

    const result = await deleteFromCloudinary(publicId);

    res.json({
      success: true,
      message: 'File deleted successfully',
      data: result
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'File deletion failed',
      error: error.message
    });
  }
};

module.exports = {
  uploadSingleFile,
  uploadMultipleFiles,
  uploadProfileImage,
  deleteFile
};