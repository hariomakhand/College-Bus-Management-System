import React, { useState } from 'react';
import SharedModal from '../shared/SharedModal';
import FileUpload from '../FileUpload';

const AddModal = ({ showModal, modalType, formData, setFormData, handleAddItem, setShowModal }) => {
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (modalType === 'bus') {           
      if (!formData.busNumber?.trim()) newErrors.busNumber = 'Bus number is required';
      else if (!/^[A-Z0-9-]+$/.test(formData.busNumber)) newErrors.busNumber = 'Invalid format (use A-Z, 0-9, -)';
      
      if (!formData.capacity || formData.capacity < 10 || formData.capacity > 100) {
        newErrors.capacity = 'Capacity must be between 10-100';
      }
      
      if (!formData.model?.trim()) newErrors.model = 'Bus model is required';
      if (!formData.registrationNumber?.trim()) newErrors.registrationNumber = 'Registration number is required';
    }

    if (modalType === 'driver') {
      if (!formData.name?.trim()) newErrors.name = 'Name is required';
      else if (formData.name.length < 2) newErrors.name = 'Name must be at least 2 characters';
      
      if (!formData.email?.trim()) newErrors.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
      
      if (!formData.password?.trim()) newErrors.password = 'Password is required';
      else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
      
      if (formData.licenseNumber && formData.licenseNumber.length < 8) {
        newErrors.licenseNumber = 'License number too short';
      }
      
      if (formData.phoneNumber && !/^[0-9]{10,15}$/.test(formData.phoneNumber.replace(/[^0-9]/g, ''))) {
        newErrors.phoneNumber = 'Invalid phone number (10-15 digits)';
      }
    }

    if (modalType === 'route') {
      if (!formData.routeName?.trim()) newErrors.routeName = 'Route name is required';
      if (!formData.startPoint?.trim()) newErrors.startPoint = 'Start point is required';
      if (!formData.endPoint?.trim()) newErrors.endPoint = 'End point is required';
      if (!formData.distance || formData.distance <= 0) newErrors.distance = 'Distance must be greater than 0';
      if (!formData.estimatedTime || formData.estimatedTime <= 0) newErrors.estimatedTime = 'Estimated time is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      await handleAddItem(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderError = (field) => {
    return errors[field] ? (
      <p className="text-red-500 text-xs mt-1">{errors[field]}</p>
    ) : null;
  };

  const renderFormFields = () => {
    if (modalType === "bus") {
      return (
        <>
          <div>
            <input
              type="text"
              placeholder="Bus Number (e.g., BUS001)"
              value={formData.busNumber || ""}
              onChange={(e) => setFormData({...formData, busNumber: e.target.value.toUpperCase()})}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                errors.busNumber ? 'border-red-500' : 'border-gray-400'
              }`}
            />
            {renderError('busNumber')}
          </div>
          
          <div>
            <input
              type="text"
              placeholder="Bus Model (e.g., Volvo B7R)"
              value={formData.model || ""}
              onChange={(e) => setFormData({...formData, model: e.target.value})}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                errors.model ? 'border-red-500' : 'border-gray-400'
              }`}
            />
            {renderError('model')}
          </div>
          
          <div>
            <input
              type="text"
              placeholder="Registration Number"
              value={formData.registrationNumber || ""}
              onChange={(e) => setFormData({...formData, registrationNumber: e.target.value.toUpperCase()})}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                errors.registrationNumber ? 'border-red-500' : 'border-gray-400'
              }`}
            />
            {renderError('registrationNumber')}
          </div>
          
          <div>
            <input
              type="number"
              placeholder="Capacity (10-100)"
              value={formData.capacity || ""}
              onChange={(e) => {
                const value = e.target.value;
                setFormData({...formData, capacity: value ? parseInt(value) : undefined});
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                errors.capacity ? 'border-red-500' : 'border-gray-400'
              }`}
              min="10"
              max="100"
            />
            {renderError('capacity')}
          </div>
          
          <div>
            <input
              type="number"
              placeholder="Manufacturing Year"
              value={formData.manufacturingYear || ""}
              onChange={(e) => {
                const value = e.target.value;
                setFormData({...formData, manufacturingYear: value ? parseInt(value) : undefined});
              }}
              className="w-full px-3 py-2 border border-gray-400 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              min="2000"
              max={new Date().getFullYear()}
            />
          </div>
          
          <select
            value={formData.status || "active"}
            onChange={(e) => setFormData({...formData, status: e.target.value})}
            className="w-full px-3 py-2 border border-gray-400 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          >
            <option value="active">Active</option>
            <option value="maintenance">Maintenance</option>
            <option value="inactive">Inactive</option>
          </select>
        </>
      );
    }

    if (modalType === "driver") {
      return (
        <>
          <div>
            <input
              type="text"
              placeholder="Full Name"
              value={formData.name || ""}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                errors.name ? 'border-red-500' : 'border-gray-400'
              }`}
            />
            {renderError('name')}
          </div>
          
          <div>
            <input
              type="email"
              placeholder="Email Address"
              value={formData.email || ""}
              onChange={(e) => setFormData({...formData, email: e.target.value.toLowerCase()})}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                errors.email ? 'border-red-500' : 'border-gray-400'
              }`}
            />
            {renderError('email')}
          </div>
          
          <div>
            <input
              type="password"
              placeholder="Password (min 6 characters)"
              value={formData.password || ""}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                errors.password ? 'border-red-500' : 'border-gray-400'
              }`}
            />
            {renderError('password')}
          </div>
          
          <div>
            <input
              type="text"
              placeholder="License Number (optional)"
              value={formData.licenseNumber || ""}
              onChange={(e) => setFormData({...formData, licenseNumber: e.target.value.toUpperCase()})}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                errors.licenseNumber ? 'border-red-500' : 'border-gray-400'
              }`}
            />
            {renderError('licenseNumber')}
          </div>
          
          <div>
            <input
              type="tel"
              placeholder="Phone Number (optional)"
              value={formData.phoneNumber || ""}
              onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                errors.phoneNumber ? 'border-red-500' : 'border-gray-400'
              }`}
            />
            {renderError('phoneNumber')}
          </div>

          {/* Profile Image Upload */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Profile Photo (Optional)
            </label>
            <FileUpload
              onUpload={(data) => setFormData({...formData, profileImage: data})}
              accept="image/*"
              folder="drivers/profiles"
              className="border-2 border-dashed border-gray-400 rounded-lg p-4"
            />
            {formData.profileImage && (
              <div className="text-sm text-yellow-700 bg-yellow-50 p-2 rounded border border-yellow-300">
                ✓ Profile photo uploaded successfully
              </div>
            )}
          </div>

          {/* License Document Upload */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              License Document (Optional)
            </label>
            <FileUpload
              onUpload={(data) => setFormData({...formData, licenseDocument: data})}
              accept="image/*,application/pdf"
              folder="drivers/licenses"
              className="border-2 border-dashed border-gray-400 rounded-lg p-4"
            />
            {formData.licenseDocument && (
              <div className="text-sm text-yellow-700 bg-yellow-50 p-2 rounded border border-yellow-300">
                ✓ License document uploaded successfully
              </div>
            )}
          </div>
        </>
      );
    }

    if (modalType === "route") {
      return (
        <>
          <div>
            <input
              type="text"
              placeholder="Route Name (e.g., Route A)"
              value={formData.routeName || ""}
              onChange={(e) => setFormData({...formData, routeName: e.target.value})}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                errors.routeName ? 'border-red-500' : 'border-gray-400'
              }`}
            />
            {renderError('routeName')}
          </div>
          
          <div>
            <input
              type="text"
              placeholder="Start Point"
              value={formData.startPoint || ""}
              onChange={(e) => setFormData({...formData, startPoint: e.target.value})}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                errors.startPoint ? 'border-red-500' : 'border-gray-400'
              }`}
            />
            {renderError('startPoint')}
          </div>
          
          <div>
            <input
              type="text"
              placeholder="End Point"
              value={formData.endPoint || ""}
              onChange={(e) => setFormData({...formData, endPoint: e.target.value})}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                errors.endPoint ? 'border-red-500' : 'border-gray-400'
              }`}
            />
            {renderError('endPoint')}
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <input
                type="number"
                placeholder="Distance (km)"
                value={formData.distance || ""}
                onChange={(e) => setFormData({...formData, distance: parseFloat(e.target.value) || ''})}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                  errors.distance ? 'border-red-500' : 'border-gray-400'
                }`}
                min="0.1"
                step="0.1"
              />
              {renderError('distance')}
            </div>
            
            <div>
              <input
                type="number"
                placeholder="Time (minutes)"
                value={formData.estimatedTime || ""}
                onChange={(e) => setFormData({...formData, estimatedTime: parseInt(e.target.value) || ''})}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                  errors.estimatedTime ? 'border-red-500' : 'border-gray-400'
                }`}
                min="1"
              />
              {renderError('estimatedTime')}
            </div>
          </div>
        </>
      );
    }

    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-2">Student registration coming soon...</p>
        <p className="text-sm text-gray-400">This feature will be available in the next update.</p>
      </div>
    );
  };

  return (
    <SharedModal
      isOpen={showModal}
      onClose={() => {
        setShowModal(false);
        setErrors({});
      }}
      title={`Add ${modalType}`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {renderFormFields()}
        
        <div className="flex space-x-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting || modalType === "student"}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              modalType === "student" || isSubmitting
                ? "bg-gray-400 text-gray-200 cursor-not-allowed" 
                : "bg-yellow-500 text-gray-900 hover:bg-yellow-600"
            }`}
          >
            {isSubmitting ? 'Adding...' : `Add ${modalType}`}
          </button>
          <button
            type="button"
            onClick={() => {
              setShowModal(false);
              setErrors({});
            }}
            className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-600 transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
        </div>
      </form>
    </SharedModal>
  );
};

export default AddModal;