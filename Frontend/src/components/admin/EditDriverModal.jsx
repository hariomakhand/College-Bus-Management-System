import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useUpdateDriverMutation } from '../../store/apiSlice';

const EditDriverModal = ({ driver, onClose, onUpdate }) => {
  const [updateDriver, { isLoading }] = useUpdateDriverMutation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    licenseNumber: '',
    phoneNumber: '',
    dateOfBirth: '',
    address: '',
    emergencyContact: '',
    experience: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (driver) {
      setFormData({
        name: driver.name || '',
        email: driver.email || '',
        licenseNumber: driver.licenseNumber || '',
        phoneNumber: driver.phoneNumber || '',
        dateOfBirth: driver.dateOfBirth ? driver.dateOfBirth.split('T')[0] : '',
        address: driver.address || '',
        emergencyContact: driver.emergencyContact || '',
        experience: driver.experience || ''
      });
    }
  }, [driver]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    }
    if (!formData.licenseNumber.trim()) {
      newErrors.licenseNumber = 'License number is required';
    }
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await updateDriver({
        id: driver._id,
        ...formData,
        experience: formData.experience ? parseInt(formData.experience) : undefined
      }).unwrap();
      
      onUpdate?.();
      onClose();
    } catch (error) {
      console.error('Failed to update driver:', error);
    }
  };

  const renderError = (field) => {
    return errors[field] ? (
      <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>
        {errors[field]}
      </p>
    ) : null;
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(4px)',
      zIndex: 60,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
        width: '100%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #ff7700 0%, #ff9233 100%)',
          padding: '20px',
          color: 'white',
          position: 'relative'
        }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              padding: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '50%',
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            }}
          >
            <X size={20} />
          </button>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            margin: 0,
            marginBottom: '8px'
          }}>
            Edit Driver Details
          </h2>
          <p style={{
            color: 'rgba(255, 255, 255, 0.8)',
            margin: 0
          }}>
            Update driver information
          </p>
        </div>

        {/* Content */}
        <div style={{ padding: '24px', maxHeight: 'calc(90vh - 120px)', overflowY: 'auto' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: errors.name ? '1px solid #dc2626' : '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.2s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#ff7700';
                    e.target.style.boxShadow = '0 0 0 3px rgba(255, 119, 0, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.name ? '#dc2626' : '#d1d5db';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                {renderError('name')}
              </div>

              <div>
                <input
                  type="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: errors.email ? '1px solid #dc2626' : '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.2s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#ff7700';
                    e.target.style.boxShadow = '0 0 0 3px rgba(255, 119, 0, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.email ? '#dc2626' : '#d1d5db';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                {renderError('email')}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <input
                  type="text"
                  placeholder="License Number"
                  value={formData.licenseNumber}
                  onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: errors.licenseNumber ? '1px solid #dc2626' : '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.2s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#ff7700';
                    e.target.style.boxShadow = '0 0 0 3px rgba(255, 119, 0, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.licenseNumber ? '#dc2626' : '#d1d5db';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                {renderError('licenseNumber')}
              </div>

              <div>
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: errors.phoneNumber ? '1px solid #dc2626' : '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.2s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#ff7700';
                    e.target.style.boxShadow = '0 0 0 3px rgba(255, 119, 0, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.phoneNumber ? '#dc2626' : '#d1d5db';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                {renderError('phoneNumber')}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <input
                  type="date"
                  placeholder="Date of Birth"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                  max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.2s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#ff7700';
                    e.target.style.boxShadow = '0 0 0 3px rgba(255, 119, 0, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div>
                <input
                  type="number"
                  placeholder="Experience (years)"
                  value={formData.experience}
                  onChange={(e) => setFormData({...formData, experience: e.target.value})}
                  min="0"
                  max="50"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.2s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#ff7700';
                    e.target.style.boxShadow = '0 0 0 3px rgba(255, 119, 0, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            <div>
              <textarea
                placeholder="Address"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                rows="3"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  resize: 'vertical'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#ff7700';
                  e.target.style.boxShadow = '0 0 0 3px rgba(255, 119, 0, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div>
              <input
                type="tel"
                placeholder="Emergency Contact Number"
                value={formData.emergencyContact}
                onChange={(e) => setFormData({...formData, emergencyContact: e.target.value})}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#ff7700';
                  e.target.style.boxShadow = '0 0 0 3px rgba(255, 119, 0, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', paddingTop: '16px' }}>
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  background: isLoading ? '#9ca3af' : 'linear-gradient(135deg, #ff7700 0%, #ff9233 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  if (!isLoading) {
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 4px 12px rgba(255, 119, 0, 0.4)';
                  }
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                {isLoading ? 'Updating...' : 'Update Driver'}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  if (!isLoading) {
                    e.target.style.backgroundColor = '#e5e7eb';
                  }
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = '#f3f4f6';
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditDriverModal;