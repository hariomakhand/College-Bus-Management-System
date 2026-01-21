import React, { useState } from 'react';
import { X, Save, User, Mail, Phone, Home, Calendar, Settings, AlertTriangle, Camera, Upload } from 'lucide-react';

const ProfileModal = ({ isOpen, onClose, userData, onSave, isLoading }) => {
  const [formData, setFormData] = useState({
    name: userData?.name || '',
    phone: userData?.phone || '',
    department: userData?.department || '',
    year: userData?.year || '',
    address: userData?.address || '',
    emergencyContact: userData?.emergencyContact || ''
  });
  const [errors, setErrors] = useState({});
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(userData?.profileImage?.url || null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const departments = ['ITEG', 'MEG', 'BTECH', 'BEG'];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (formData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.department) {
      newErrors.department = 'Department is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleClose = () => {
    setFormData({
      name: userData?.name || '',
      phone: userData?.phone || '',
      department: userData?.department || '',
      year: userData?.year || '',
      address: userData?.address || '',
      emergencyContact: userData?.emergencyContact || ''
    });
    setErrors({});
    setProfileImage(null);
    setImagePreview(userData?.profileImage?.url || null);
    onClose();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadProfileImage = async () => {
    if (!profileImage) return;
    
    setUploadingImage(true);
    const formData = new FormData();
    formData.append('profileImage', profileImage);
    
    try {
      const response = await fetch('http://localhost:5001/api/student/upload-profile-image', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      
      const result = await response.json();
      if (result.success) {
        alert('Profile image uploaded successfully!');
        setProfileImage(null);
        // Trigger parent component refresh
        if (onSave) {
          onSave({ refreshOnly: true });
        }
      } else {
        alert('Failed to upload image: ' + result.message);
      }
    } catch (error) {
      alert('Error uploading image: ' + error.message);
    } finally {
      setUploadingImage(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <User size={24} />
              <h2 className="text-xl font-bold">Edit Profile</h2>
            </div>
            <button 
              onClick={handleClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="space-y-6">
            {/* Profile Image Upload */}
            <div className="text-center">
              <label className="flex items-center justify-center gap-2 text-sm font-bold text-gray-700 mb-4">
                <Camera size={16} className="text-blue-600" />
                Profile Photo
              </label>
              <div className="flex flex-col items-center space-y-4">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-200 bg-gray-100">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="text-gray-400" size={32} />
                    </div>
                  )}
                </div>
                <div className="flex space-x-2">
                  <label className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center gap-2">
                    <Upload size={16} />
                    Choose Photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                  {profileImage && (
                    <button
                      type="button"
                      onClick={uploadProfileImage}
                      disabled={uploadingImage}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm disabled:opacity-50"
                    >
                      {uploadingImage ? 'Uploading...' : 'Upload'}
                    </button>
                  )}
                </div>
              </div>
            </div>
            {/* Name */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                <User size={16} className="text-blue-600" />
                Full Name *
              </label>
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Enter your full name" 
                className={`w-full p-3 border-2 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-400 bg-red-50' : 'border-gray-300 focus:border-blue-500'
                }`}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertTriangle size={14} />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Email (Read-only) */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                <Mail size={16} className="text-blue-600" />
                Email Address
              </label>
              <div className="p-3 bg-gray-100 border-2 border-gray-200 rounded-lg">
                <p className="text-gray-700">{userData?.email || 'Not provided'}</p>
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                <Phone size={16} className="text-blue-600" />
                Phone Number
              </label>
              <input 
                type="tel" 
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="+1234567890" 
                className={`w-full p-3 border-2 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.phone ? 'border-red-400 bg-red-50' : 'border-gray-300 focus:border-blue-500'
                }`}
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertTriangle size={14} />
                  {errors.phone}
                </p>
              )}
            </div>

            {/* Department */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                <Settings size={16} className="text-blue-600" />
                Department *
              </label>
              <select 
                value={formData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
                className={`w-full p-3 border-2 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.department ? 'border-red-400 bg-red-50' : 'border-gray-300 focus:border-blue-500'
                }`}
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              {errors.department && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertTriangle size={14} />
                  {errors.department}
                </p>
              )}
            </div>

            {/* Year */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                <Calendar size={16} className="text-blue-600" />
                Academic Year
              </label>
              <select 
                value={formData.year}
                onChange={(e) => setFormData({...formData, year: e.target.value})}
                className="w-full p-3 border-2 border-gray-300 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Year</option>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>
            </div>

            {/* Address */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                <Home size={16} className="text-blue-600" />
                Home Address
              </label>
              <textarea 
                rows={3} 
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                placeholder="Enter your complete address" 
                className="w-full p-3 border-2 border-gray-300 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            </div>

            {/* Emergency Contact */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                <AlertTriangle size={16} className="text-red-600" />
                Emergency Contact
              </label>
              <input 
                type="tel" 
                value={formData.emergencyContact}
                onChange={(e) => setFormData({...formData, emergencyContact: e.target.value})}
                placeholder="Emergency contact number" 
                className="w-full p-3 border-2 border-gray-300 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-3 px-4 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileModal;