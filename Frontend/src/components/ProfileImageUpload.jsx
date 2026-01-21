import React, { useState } from 'react';
import { Camera, Upload, X, User } from 'lucide-react';

const ProfileImageUpload = ({ 
  currentImage, 
  onUpload, 
  userId, 
  userType = 'user',
  size = 'large' // small, medium, large
}) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentImage);

  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-24 h-24', 
    large: 'w-32 h-32'
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);

    // Upload to server
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', userId);
      formData.append('userType', userType);

      const response = await fetch('http://localhost:5001/api/upload/profile', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      const result = await response.json();
      if (result.success) {
        onUpload(result.data);
        setPreview(result.data.url);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed: ' + error.message);
      setPreview(currentImage); // Reset preview on error
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-3">
      <div className={`relative ${sizeClasses[size]} rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-lg`}>
        {preview ? (
          <img 
            src={preview} 
            alt="Profile" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <User className="text-gray-400" size={size === 'large' ? 48 : size === 'medium' ? 32 : 24} />
          </div>
        )}
        
        {/* Upload Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
          <label htmlFor={`profile-upload-${userId}`} className="cursor-pointer">
            {uploading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Camera className="text-white" size={24} />
            )}
          </label>
        </div>
      </div>

      <input
        id={`profile-upload-${userId}`}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />

      <label
        htmlFor={`profile-upload-${userId}`}
        className="inline-flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded-full hover:bg-blue-700 cursor-pointer transition-colors disabled:opacity-50"
      >
        <Upload size={14} className="mr-1" />
        {uploading ? 'Uploading...' : 'Change Photo'}
      </label>
    </div>
  );
};

export default ProfileImageUpload;