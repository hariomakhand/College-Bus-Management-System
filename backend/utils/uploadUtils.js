const cloudinary = require('../config/cloudinary');
const { Readable } = require('stream');

// Upload single file to Cloudinary
const uploadToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'auto',
        folder: options.folder || 'bus-management',
        public_id: options.public_id,
        transformation: options.transformation,
        ...options
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    // Convert buffer to stream and pipe to Cloudinary
    const stream = Readable.from(buffer);
    stream.pipe(uploadStream);
  });
};

// Upload multiple files to Cloudinary
const uploadMultipleToCloudinary = async (files, options = {}) => {
  const uploadPromises = files.map((file, index) => {
    const fileOptions = {
      ...options,
      public_id: options.public_id ? `${options.public_id}_${index}` : undefined,
    };
    return uploadToCloudinary(file.buffer, fileOptions);
  });

  return Promise.all(uploadPromises);
};

// Delete file from Cloudinary
const deleteFromCloudinary = (publicId) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

// Get optimized image URL
const getOptimizedImageUrl = (publicId, options = {}) => {
  return cloudinary.url(publicId, {
    fetch_format: 'auto',
    quality: 'auto',
    width: options.width || 300,
    height: options.height || 300,
    crop: options.crop || 'fill',
    ...options
  });
};

module.exports = {
  uploadToCloudinary,
  uploadMultipleToCloudinary,
  deleteFromCloudinary,
  getOptimizedImageUrl
};