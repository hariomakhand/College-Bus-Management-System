import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useUpdateBusMutation } from '../../store/apiSlice';

const EditBusModal = ({ bus, onClose, onUpdate }) => {
  const [updateBus, { isLoading }] = useUpdateBusMutation();
  const [formData, setFormData] = useState({
    busNumber: '',
    model: '',
    registrationNumber: '',
    capacity: '',
    manufacturingYear: '',
    status: 'active'
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (bus) {
      setFormData({
        busNumber: bus.busNumber || '',
        model: bus.model || '',
        registrationNumber: bus.registrationNumber || '',
        capacity: bus.capacity || '',
        manufacturingYear: bus.manufacturingYear || '',
        status: bus.status || 'active'
      });
    }
  }, [bus]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.busNumber.trim()) {
      newErrors.busNumber = 'Bus number is required';
    }
    if (!formData.model.trim()) {
      newErrors.model = 'Model is required';
    }
    if (!formData.registrationNumber.trim()) {
      newErrors.registrationNumber = 'Registration number is required';
    }
    if (!formData.capacity || formData.capacity < 1) {
      newErrors.capacity = 'Valid capacity is required';
    }
    if (!formData.manufacturingYear || formData.manufacturingYear < 1990) {
      newErrors.manufacturingYear = 'Valid manufacturing year is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await updateBus({
        id: bus._id,
        ...formData,
        capacity: parseInt(formData.capacity),
        manufacturingYear: parseInt(formData.manufacturingYear)
      }).unwrap();
      
      onUpdate?.();
      onClose();
    } catch (error) {
      console.error('Failed to update bus:', error);
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
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(4px)',
      zIndex: 50,
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
        maxWidth: '500px',
        maxHeight: '90vh',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
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
            Edit Bus Details
          </h2>
          <p style={{
            color: 'rgba(255, 255, 255, 0.8)',
            margin: 0
          }}>
            Update bus information
          </p>
        </div>

        {/* Content */}
        <div style={{ padding: '24px', maxHeight: 'calc(90vh - 120px)', overflowY: 'auto' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <input
                  type="text"
                  placeholder="Bus Number (e.g., BUS001)"
                  value={formData.busNumber}
                  onChange={(e) => setFormData({...formData, busNumber: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: errors.busNumber ? '1px solid #dc2626' : '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.2s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3B82F6';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.busNumber ? '#dc2626' : '#d1d5db';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                {renderError('busNumber')}
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Model (e.g., Volvo B7R)"
                  value={formData.model}
                  onChange={(e) => setFormData({...formData, model: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: errors.model ? '1px solid #dc2626' : '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.2s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3B82F6';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.model ? '#dc2626' : '#d1d5db';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                {renderError('model')}
              </div>
            </div>

            <div>
              <input
                type="text"
                placeholder="Registration Number"
                value={formData.registrationNumber}
                onChange={(e) => setFormData({...formData, registrationNumber: e.target.value})}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: errors.registrationNumber ? '1px solid #dc2626' : '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3B82F6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = errors.registrationNumber ? '#dc2626' : '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
              />
              {renderError('registrationNumber')}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <input
                  type="number"
                  placeholder="Capacity (seats)"
                  value={formData.capacity}
                  onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                  min="1"
                  max="100"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: errors.capacity ? '1px solid #dc2626' : '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.2s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3B82F6';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.capacity ? '#dc2626' : '#d1d5db';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                {renderError('capacity')}
              </div>

              <div>
                <input
                  type="number"
                  placeholder="Manufacturing Year"
                  value={formData.manufacturingYear}
                  onChange={(e) => setFormData({...formData, manufacturingYear: e.target.value})}
                  min="1990"
                  max={new Date().getFullYear()}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: errors.manufacturingYear ? '1px solid #dc2626' : '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.2s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3B82F6';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.manufacturingYear ? '#dc2626' : '#d1d5db';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                {renderError('manufacturingYear')}
              </div>
            </div>

            <div>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  backgroundColor: 'white',
                  cursor: 'pointer'
                }}
              >
                <option value="active">Active</option>
                <option value="maintenance">Maintenance</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '12px', paddingTop: '16px' }}>
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  background: isLoading ? '#9ca3af' : 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
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
                    e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
                  }
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                {isLoading ? 'Updating...' : 'Update Bus'}
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

export default EditBusModal;