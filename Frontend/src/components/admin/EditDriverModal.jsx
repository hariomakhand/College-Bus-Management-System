import React, { useState } from 'react';
import { X, Save, Upload, FileText, Image, Eye } from 'lucide-react';
import FileUpload from '../FileUpload';

const EditDriverModal = ({ driver, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: driver.name || '',
    email: driver.email || '',
    phoneNumber: driver.phoneNumber || '',
    licenseNumber: driver.licenseNumber || '',
    address: driver.address || '',
    emergencyContact: driver.emergencyContact || '',
    experience: driver.experience || '',
    dateOfBirth: driver.dateOfBirth ? new Date(driver.dateOfBirth).toISOString().split('T')[0] : '',
    licenseDocument: driver.licenseDocument || null,
    profileImage: driver.profileImage || null
  });
  
  const [loading, setLoading] = useState(false);
  const [showLicenseImage, setShowLicenseImage] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`http://localhost:5001/api/admin/drivers/${driver._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      
      if (result.success) {
        alert('Driver updated successfully!');
        onUpdate();
        onClose();
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Update error:', error);
      alert('Failed to update driver: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLicenseUpload = (uploadData) => {
    setFormData({
      ...formData,
      licenseDocument: {
        url: uploadData.url,
        publicId: uploadData.publicId
      }
    });
  };

  const handleProfileImageUpload = (uploadData) => {
    setFormData({
      ...formData,
      profileImage: {
        url: uploadData.url,
        publicId: uploadData.publicId
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-700 to-yellow-600 px-6 py-4 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
          <h2 className="text-2xl font-bold">Edit Driver - {driver.name}</h2>
          <p className="text-yellow-100">Update driver information and documents</p>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-400 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-400 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-400 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  License Number
                </label>
                <input
                  type="text"
                  value={formData.licenseNumber}
                  onChange={(e) => setFormData({...formData, licenseNumber: e.target.value.toUpperCase()})}
                  className="w-full px-3 py-2 border border-gray-400 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-400 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience (Years)
                </label>
                <input
                  type="number"
                  value={formData.experience}
                  onChange={(e) => setFormData({...formData, experience: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-400 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  min="0"
                  max="50"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-400 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                placeholder="Enter full address..."
              />
            </div>

            {/* Emergency Contact */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Emergency Contact
              </label>
              <input
                type="tel"
                value={formData.emergencyContact}
                onChange={(e) => setFormData({...formData, emergencyContact: e.target.value})}
                className="w-full px-3 py-2 border border-gray-400 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                placeholder="Emergency contact number"
              />
            </div>

            {/* Profile Image & License Document Section */}
            <div className="border-t pt-6 space-y-6">
              {/* Profile Image Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Image className="mr-2 text-yellow-600" size={20} />
                  Profile Photo
                </h3>

                {/* Current Profile Image */}
                {formData.profileImage?.url && (
                  <div className="mb-4 p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100">
                        <img
                          src={formData.profileImage.url}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Current Profile Photo</p>
                        <p className="text-sm text-gray-700">
                          Uploaded: {formData.profileImage.uploadedAt ? 
                            new Date(formData.profileImage.uploadedAt).toLocaleDateString() : 
                            'Previously uploaded'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Upload New Profile Image */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    {formData.profileImage?.url ? 'Replace Profile Photo' : 'Upload Profile Photo'}
                  </label>
                  <FileUpload
                    onUpload={handleProfileImageUpload}
                    accept="image/*"
                    folder="drivers/profiles"
                    className="border-2 border-dashed border-gray-400 rounded-lg p-4"
                  />
                  <p className="text-xs text-gray-500">
                    Supported formats: JPG, PNG, GIF (Max 10MB)
                  </p>
                </div>
              </div>

              {/* License Document Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FileText className="mr-2 text-yellow-600" size={20} />
                  License Document
                </h3>

                {/* Current License Document */}
                {formData.licenseDocument?.url && (
                  <div className="mb-4 p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                          <Image className="text-yellow-600" size={24} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">License Document Available</p>
                          <p className="text-sm text-gray-700">
                            Uploaded: {formData.licenseDocument.uploadedAt ? 
                              new Date(formData.licenseDocument.uploadedAt).toLocaleDateString() : 
                              'Previously uploaded'
                            }
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowLicenseImage(true)}
                        className="flex items-center space-x-2 px-3 py-2 bg-yellow-500 text-gray-900 rounded-lg hover:bg-yellow-600 transition-colors"
                      >
                        <Eye size={16} />
                        <span>View</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Upload New License Document */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    {formData.licenseDocument?.url ? 'Replace License Document' : 'Upload License Document'}
                  </label>
                  <FileUpload
                    onUpload={handleLicenseUpload}
                    accept="image/*,application/pdf"
                    folder="drivers/licenses"
                    className="border-2 border-dashed border-gray-400 rounded-lg p-4"
                  />
                  <p className="text-xs text-gray-500">
                    Supported formats: JPG, PNG, PDF (Max 10MB)
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 border-t">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2 border border-gray-400 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 bg-yellow-500 text-gray-900 rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50 flex items-center space-x-2 font-semibold"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                <span>Updating...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Update Driver</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* License Image Viewer Modal */}
      {showLicenseImage && formData.licenseDocument?.url && (
        <div className="fixed inset-0 bg-black/80 z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">License Document</h3>
              <button
                onClick={() => setShowLicenseImage(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4">
              <img
                src={formData.licenseDocument.url}
                alt="License Document"
                className="max-w-full max-h-[70vh] object-contain mx-auto rounded-lg"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <div className="hidden text-center py-8">
                <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">Unable to display document preview</p>
                <a
                  href={formData.licenseDocument.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  Open in new tab
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditDriverModal;
