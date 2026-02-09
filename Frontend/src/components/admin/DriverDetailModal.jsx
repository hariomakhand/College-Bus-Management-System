import React, { useState } from 'react';
import { X, Phone, Mail, MapPin, Calendar, Award, Shield, Clock, User, CreditCard, Edit } from 'lucide-react';
import EditDriverModal from './EditDriverModal';

const DriverDetailModal = ({ driver, onClose }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Debug: Log driver data to see license document
  console.log('Driver data in modal:', driver);
  console.log('License document:', driver?.licenseDocument);
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-700 to-yellow-600 px-6 py-4 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center overflow-hidden">
              {driver.profileImage?.url ? (
                <img
                  src={driver.profileImage.url}
                  alt="Driver Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={32} className="text-white" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{driver.name}</h2>
              <p className="text-yellow-100">Professional Driver</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{
          padding: '24px',
          overflowY: 'auto',
          maxHeight: 'calc(90vh - 200px)'
        }}>
          {/* Status Badge */}
          <div style={{ marginBottom: '24px' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: '500',
              backgroundColor: driver.isVerified ? '#fef3c7' : '#f3f4f6',
              color: driver.isVerified ? '#92400e' : '#4b5563',
              border: driver.isVerified ? '1px solid #fde68a' : '1px solid #d1d5db'
            }}>
              <Shield size={16} style={{ marginRight: '8px' }} />
              {driver.isVerified ? 'Verified Driver' : 'Pending Verification'}
            </span>
          </div>

          {/* Main Info Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '1fr 1fr',
            gap: '24px',
            marginBottom: '24px'
          }}>
            {/* Contact Information */}
            <div style={{
              backgroundColor: '#f9fafb',
              borderRadius: '12px',
              padding: '16px'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center'
              }}>
                <Phone size={20} style={{ marginRight: '8px', color: '#eab308' }} />
                Contact Information
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Mail size={16} style={{ color: '#6b7280' }} />
                  <div>
                    <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Email</p>
                    <p style={{ fontWeight: '500', color: '#111827', margin: 0 }}>{driver.email}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Phone size={16} style={{ color: '#6b7280' }} />
                  <div>
                    <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Phone</p>
                    <p style={{ fontWeight: '500', color: '#111827', margin: 0 }}>{driver.phoneNumber || 'Not provided'}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <MapPin size={16} style={{ color: '#6b7280' }} />
                  <div>
                    <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Address</p>
                    <p style={{ fontWeight: '500', color: '#111827', margin: 0 }}>{driver.address || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Details */}
            <div style={{
              backgroundColor: '#f9fafb',
              borderRadius: '12px',
              padding: '16px'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center'
              }}>
                <CreditCard size={20} style={{ marginRight: '8px', color: '#eab308' }} />
                Professional Details
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Award size={16} style={{ color: '#6b7280' }} />
                  <div>
                    <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>License Number</p>
                    <p style={{ fontWeight: '500', color: '#111827', margin: 0, fontFamily: 'monospace' }}>{driver.licenseNumber || 'Not provided'}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Clock size={16} style={{ color: '#6b7280' }} />
                  <div>
                    <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Experience</p>
                    <p style={{ fontWeight: '500', color: '#111827', margin: 0 }}>
                      {driver.experience ? `${driver.experience} years` : 'Not specified'}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Calendar size={16} style={{ color: '#6b7280' }} />
                  <div>
                    <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Age</p>
                    <p style={{ fontWeight: '500', color: '#111827', margin: 0 }}>
                      {calculateAge(driver.dateOfBirth)} years old
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* License Document */}
          {driver.licenseDocument?.url ? (
            <div style={{
              backgroundColor: '#fef3c7',
              border: '1px solid #fde68a',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '24px'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#92400e',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center'
              }}>
                <CreditCard size={20} style={{ marginRight: '8px', color: '#eab308' }} />
                License Document
              </h3>
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '12px',
                border: '2px dashed #eab308'
              }}>
                <img
                  src={driver.licenseDocument.url}
                  alt="Driver License"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '300px',
                    objectFit: 'contain',
                    borderRadius: '4px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                <div style={{
                  display: 'none',
                  textAlign: 'center',
                  color: '#6b7280',
                  padding: '20px'
                }}>
                  <CreditCard size={48} style={{ color: '#d1d5db', marginBottom: '8px' }} />
                  <p style={{ margin: 0 }}>License document could not be loaded</p>
                </div>
              </div>
              <p style={{
                fontSize: '12px',
                color: '#6b7280',
                textAlign: 'center',
                margin: '8px 0 0 0'
              }}>
                Uploaded on: {driver.licenseDocument.uploadedAt ? new Date(driver.licenseDocument.uploadedAt).toLocaleDateString() : 'Unknown'}
              </p>
            </div>
          ) : (
            <div style={{
              backgroundColor: '#f3f4f6',
              border: '1px solid #d1d5db',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '24px',
              textAlign: 'center'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#4b5563',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <CreditCard size={20} style={{ marginRight: '8px', color: '#6b7280' }} />
                License Document
              </h3>
              <p style={{ color: '#4b5563', margin: 0 }}>
                📄 No license document uploaded yet
              </p>
            </div>
          )}

          {/* Emergency Contact */}
          {driver.emergencyContact && (
            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '24px'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#7f1d1d',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center'
              }}>
                <Phone size={20} style={{ marginRight: '8px', color: '#dc2626' }} />
                Emergency Contact
              </h3>
              <p style={{ fontWeight: '500', color: '#991b1b', margin: 0 }}>{driver.emergencyContact}</p>
            </div>
          )}

          {/* Assignment Status */}
          <div style={{
            backgroundColor: '#fef3c7',
            border: '1px solid #fde68a',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#92400e',
              marginBottom: '12px'
            }}>Current Assignment</h3>
            {driver.assignedBus ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#92400e' }}>Bus Number:</span>
                  <span style={{ fontWeight: '600', color: '#92400e' }}>{driver.assignedBus.busNumber}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#92400e' }}>Capacity:</span>
                  <span style={{ fontWeight: '600', color: '#92400e' }}>{driver.assignedBus.capacity} seats</span>
                </div>
                {driver.assignedBus.route && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#92400e' }}>Route:</span>
                    <span style={{ fontWeight: '600', color: '#92400e' }}>{driver.assignedBus.route.routeName}</span>
                  </div>
                )}
              </div>
            ) : (
              <p style={{ color: '#92400e', margin: 0 }}>No bus currently assigned</p>
            )}
          </div>

          {/* Account Information */}
          <div style={{
            backgroundColor: '#f9fafb',
            borderRadius: '12px',
            padding: '16px'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#111827',
              marginBottom: '12px'
            }}>Account Information</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '1fr 1fr',
              gap: '16px'
            }}>
              <div>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Date of Birth</p>
                <p style={{ fontWeight: '500', color: '#111827', margin: 0 }}>
                  {driver.dateOfBirth ? formatDate(driver.dateOfBirth) : 'Not provided'}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Joined Date</p>
                <p style={{ fontWeight: '500', color: '#111827', margin: 0 }}>
                  {formatDate(driver.createdAt)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          backgroundColor: '#f9fafb',
          padding: '20px 24px',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
          borderTop: '1px solid #e5e7eb'
        }}>
          <button
            onClick={() => setShowEditModal(true)}
            style={{
              padding: '12px 24px',
              backgroundColor: '#eab308',
              color: '#1f2937',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#ca8a04';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#eab308';
            }}
          >
            <Edit size={16} />
            <span>Edit Driver</span>
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '12px 24px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#4b5563';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#6b7280';
            }}
          >
            Close
          </button>
        </div>

        {/* Edit Modal */}
        {showEditModal && (
          <EditDriverModal
            driver={driver}
            onClose={() => setShowEditModal(false)}
            onUpdate={() => {
              setShowEditModal(false);
              // The parent will refresh automatically due to RTK Query
            }}
          />
        )}
      </div>
    </div>
  );
};

export default DriverDetailModal;