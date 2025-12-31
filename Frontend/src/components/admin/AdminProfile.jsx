import React, { useState } from 'react';
import { User, Edit3, Save, X, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import { useAuth } from '../../Context/AuthContext';

const AdminProfile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    department: user?.department || '',
    address: user?.address || '',
    joinDate: user?.joinDate || ''
  });
  const [errors, setErrors] = useState({});

  const departments = ['ITEG', 'MEG', 'BTECH', 'BEG'];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
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

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      // Here you would typically make an API call to update the profile
      console.log('Updating profile:', formData);
      alert('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      alert('Failed to update profile: ' + error.message);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      department: user?.department || '',
      address: user?.address || '',
      joinDate: user?.joinDate || ''
    });
    setErrors({});
    setIsEditing(false);
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '16px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
      padding: '24px',
      width: '100%'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <User size={20} style={{ color: 'white' }} />
          </div>
          <div>
            <h3 style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#1f2937',
              margin: 0
            }}>
              Admin Profile
            </h3>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
              Manage your profile information
            </p>
          </div>
        </div>

        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Edit3 size={16} />
            Edit Profile
          </button>
        ) : (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleSave}
              style={{
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Save size={16} />
              Save
            </button>
            <button
              onClick={handleCancel}
              style={{
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <X size={16} />
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Profile Form */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px'
      }}>
        {/* Personal Information */}
        <div>
          <h4 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '16px',
            borderBottom: '2px solid #e5e7eb',
            paddingBottom: '8px'
          }}>
            Personal Information
          </h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Name Field */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '6px'
              }}>
                Full Name *
              </label>
              {isEditing ? (
                <div>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: errors.name ? '2px solid #ef4444' : '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                    placeholder="Enter your full name"
                  />
                  {errors.name && (
                    <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                      {errors.name}
                    </p>
                  )}
                </div>
              ) : (
                <p style={{ color: '#1f2937', fontSize: '14px' }}>
                  {formData.name || 'Not provided'}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '6px'
              }}>
                <Mail size={16} style={{ display: 'inline', marginRight: '6px' }} />
                Email Address *
              </label>
              {isEditing ? (
                <div>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: errors.email ? '2px solid #ef4444' : '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                    placeholder="Enter your email address"
                  />
                  {errors.email && (
                    <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                      {errors.email}
                    </p>
                  )}
                </div>
              ) : (
                <p style={{ color: '#1f2937', fontSize: '14px' }}>
                  {formData.email || 'Not provided'}
                </p>
              )}
            </div>

            {/* Phone Field */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '6px'
              }}>
                <Phone size={16} style={{ display: 'inline', marginRight: '6px' }} />
                Phone Number
              </label>
              {isEditing ? (
                <div>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: errors.phone ? '2px solid #ef4444' : '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                    placeholder="Enter your phone number"
                  />
                  {errors.phone && (
                    <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                      {errors.phone}
                    </p>
                  )}
                </div>
              ) : (
                <p style={{ color: '#1f2937', fontSize: '14px' }}>
                  {formData.phone || 'Not provided'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Professional Information */}
        <div>
          <h4 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '16px',
            borderBottom: '2px solid #e5e7eb',
            paddingBottom: '8px'
          }}>
            Professional Information
          </h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Department Field */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '6px'
              }}>
                Department *
              </label>
              {isEditing ? (
                <div>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: errors.department ? '2px solid #ef4444' : '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      backgroundColor: 'white'
                    }}
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                  {errors.department && (
                    <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                      {errors.department}
                    </p>
                  )}
                </div>
              ) : (
                <p style={{ color: '#1f2937', fontSize: '14px' }}>
                  {formData.department || 'Not specified'}
                </p>
              )}
            </div>

            {/* Join Date Field */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '6px'
              }}>
                <Calendar size={16} style={{ display: 'inline', marginRight: '6px' }} />
                Join Date
              </label>
              {isEditing ? (
                <input
                  type="date"
                  value={formData.joinDate}
                  onChange={(e) => setFormData({...formData, joinDate: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              ) : (
                <p style={{ color: '#1f2937', fontSize: '14px' }}>
                  {formData.joinDate ? new Date(formData.joinDate).toLocaleDateString() : 'Not provided'}
                </p>
              )}
            </div>

            {/* Address Field */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '6px'
              }}>
                <MapPin size={16} style={{ display: 'inline', marginRight: '6px' }} />
                Address
              </label>
              {isEditing ? (
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                  placeholder="Enter your address"
                />
              ) : (
                <p style={{ color: '#1f2937', fontSize: '14px' }}>
                  {formData.address || 'Not provided'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Role Information */}
      <div style={{
        marginTop: '24px',
        padding: '16px',
        backgroundColor: '#f3f4f6',
        borderRadius: '8px'
      }}>
        <h4 style={{
          fontSize: '16px',
          fontWeight: '600',
          color: '#1f2937',
          marginBottom: '8px'
        }}>
          Account Information
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div>
            <span style={{ fontSize: '14px', color: '#6b7280' }}>Role: </span>
            <span style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>
              {user?.role || 'Admin'}
            </span>
          </div>
          <div>
            <span style={{ fontSize: '14px', color: '#6b7280' }}>User ID: </span>
            <span style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>
              {user?._id || 'N/A'}
            </span>
          </div>
          <div>
            <span style={{ fontSize: '14px', color: '#6b7280' }}>Status: </span>
            <span style={{
              fontSize: '12px',
              fontWeight: '500',
              color: '#10b981',
              backgroundColor: '#dcfce7',
              padding: '2px 8px',
              borderRadius: '12px'
            }}>
              Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;