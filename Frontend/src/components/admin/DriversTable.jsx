import React, { useState } from 'react';
import { UserCheck, Plus, Loader2, Trash2, UserX, Bus as BusIcon, MapPin } from 'lucide-react';
import DriverDetailModal from './DriverDetailModal';

const DriversTable = ({
  drivers,
  buses,
  loading,
  setShowModal,
  setModalType,
  setSelectedDriver,
  setAssignModal,
  handleUnassignBus,
  deleteUser
}) => {
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDriverDetail, setSelectedDriverDetail] = useState(null);

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '16px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
      padding: '24px',
      width: '100%',
      animation: 'fadeIn 0.5s ease-in'
    }}>
      {/* Header Section */}
      <div style={{
        display: 'flex',
        flexDirection: window.innerWidth < 640 ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: window.innerWidth < 640 ? 'stretch' : 'center',
        gap: '16px',
        marginBottom: '24px'
      }}>
        {/* Left Side - Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: '#2563eb',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <UserCheck size={20} style={{ color: 'white' }} />
          </div>
          <div>
            <h3 style={{
              fontSize: window.innerWidth < 640 ? '18px' : '20px',
              fontWeight: 'bold',
              color: '#1f2937',
              margin: 0
            }}>
              Driver Management
            </h3>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
              Total: {drivers.length} drivers
            </p>
          </div>
        </div>

        {/* Right Side - Add Button */}
        <button
          onClick={() => { setShowModal(true); setModalType('driver'); }}
          style={{
            background: '#2563eb',
            color: 'white',
            border: 'none',
            padding: window.innerWidth < 640 ? '12px 16px' : '12px 24px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = '#1d4ed8';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = '#2563eb';
          }}
        >
          <Plus size={16} />
          {window.innerWidth < 640 ? 'Add Driver' : 'Add New Driver'}
        </button>
      </div>

      {loading ? (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 0'
        }}>
          <Loader2 style={{
            width: '32px',
            height: '32px',
            color: '#2563eb',
            animation: 'spin 1s linear infinite'
          }} />
          <span style={{ marginLeft: '12px', color: '#6b7280' }}>Loading drivers...</span>
        </div>
      ) : drivers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <div style={{
            width: '64px',
            height: '64px',
            backgroundColor: '#f3f4f6',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <UserCheck size={32} style={{ color: '#9ca3af' }} />
          </div>
          <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
            No drivers found
          </h4>
          <p style={{ color: '#6b7280' }}>Add your first driver to get started</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{
                background: '#f8fafc',
                borderBottom: '2px solid #e2e8f0'
              }}>
                <th style={{
                  textAlign: 'left',
                  padding: window.innerWidth < 640 ? '12px' : '16px',
                  fontWeight: '600',
                  color: '#374151',
                  minWidth: '120px'
                }}>Driver Info</th>
                <th style={{
                  textAlign: 'left',
                  padding: window.innerWidth < 640 ? '12px' : '16px',
                  fontWeight: '600',
                  color: '#374151',
                  display: window.innerWidth < 640 ? 'none' : 'table-cell'
                }}>Contact & License</th>
                <th style={{
                  textAlign: 'left',
                  padding: window.innerWidth < 640 ? '12px' : '16px',
                  fontWeight: '600',
                  color: '#374151'
                }}>Status</th>
                <th style={{
                  textAlign: 'left',
                  padding: window.innerWidth < 640 ? '12px' : '16px',
                  fontWeight: '600',
                  color: '#374151',
                  display: window.innerWidth < 768 ? 'none' : 'table-cell'
                }}>Assigned Bus</th>
                <th style={{
                  textAlign: 'center',
                  padding: window.innerWidth < 640 ? '12px' : '16px',
                  fontWeight: '600',
                  color: '#374151'
                }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {drivers.map((driver, index) => {
                const assignedBus = driver.assignedBus;

                return (
                  <tr key={driver._id} style={{
                    borderBottom: '1px solid #f3f4f6',
                    backgroundColor: index % 2 === 0 ? 'white' : '#f9fafb',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#eff6ff';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'white' : '#f9fafb';
                  }}>
                    <td style={{ padding: window.innerWidth < 640 ? '12px' : '16px' }}>
                      <div style={{ fontWeight: '600', color: '#1f2937' }}>{driver.name}</div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        {driver.email}
                      </div>
                      {window.innerWidth < 640 && (
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                          {driver.licenseNumber} • {driver.phoneNumber}
                        </div>
                      )}
                    </td>
                    
                    <td style={{
                      padding: window.innerWidth < 640 ? '12px' : '16px',
                      color: '#6b7280',
                      display: window.innerWidth < 640 ? 'none' : 'table-cell'
                    }}>
                      <div style={{ fontSize: '13px', fontWeight: '500' }}>{driver.phoneNumber}</div>
                      <div style={{ fontSize: '12px', color: '#9ca3af' }}>{driver.licenseNumber}</div>
                      {driver.experience && (
                        <div style={{ fontSize: '11px', color: '#6b7280' }}>
                          {driver.experience} years exp
                        </div>
                      )}
                    </td>

                    <td style={{ padding: window.innerWidth < 640 ? '12px' : '16px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '500',
                        backgroundColor: driver.isVerified ? '#dcfce7' : '#fee2e2',
                        color: driver.isVerified ? '#166534' : '#991b1b'
                      }}>
                        {driver.isVerified ? '✅ Verified' : '⏳ Pending'}
                      </span>
                    </td>

                    <td style={{
                      padding: window.innerWidth < 640 ? '12px' : '16px',
                      display: window.innerWidth < 768 ? 'none' : 'table-cell'
                    }}>
                      {assignedBus ? (
                        <div>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '4px 8px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            backgroundColor: '#dcfce7',
                            color: '#166534',
                            fontWeight: '500',
                            marginBottom: '4px'
                          }}>
                            🚌 {assignedBus.busNumber}
                          </span>
                          {assignedBus.route && (
                            <div style={{
                              fontSize: '11px',
                              color: '#6b7280',
                              fontStyle: 'italic'
                            }}>
                              📍 {assignedBus.route.routeName}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span style={{ 
                          color: '#ef4444', 
                          fontSize: '12px',
                          fontWeight: '500'
                        }}>❌ No Bus Assigned</span>
                      )}
                    </td>

                    <td style={{ padding: window.innerWidth < 640 ? '12px' : '16px' }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        flexWrap: 'wrap'
                      }}>
                        {assignedBus ? (
                          <button
                            onClick={() => handleUnassignBus(driver._id)}
                            style={{
                              backgroundColor: '#ef4444',
                              color: 'white',
                              border: 'none',
                              padding: '6px 10px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: '500',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              minWidth: '80px',
                              justifyContent: 'center'
                            }}
                            onMouseOver={(e) => {
                              e.target.style.backgroundColor = '#dc2626';
                            }}
                            onMouseOut={(e) => {
                              e.target.style.backgroundColor = '#ef4444';
                            }}
                          >
                            <UserX size={10} />
                            Unassign
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedDriver(driver);
                              setAssignModal(true);
                            }}
                            style={{
                              backgroundColor: '#2563eb',
                              color: 'white',
                              border: 'none',
                              padding: '6px 10px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: '500',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              minWidth: '80px',
                              justifyContent: 'center'
                            }}
                            onMouseOver={(e) => {
                              e.target.style.backgroundColor = '#1d4ed8';
                            }}
                            onMouseOut={(e) => {
                              e.target.style.backgroundColor = '#2563eb';
                            }}
                          >
                            <BusIcon size={10} />
                            Assign
                          </button>
                        )}

                        <button
                          onClick={() => deleteUser('drivers', driver._id)}
                          style={{
                            color: '#dc2626',
                            backgroundColor: 'transparent',
                            border: '1px solid #fecaca',
                            padding: '6px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minWidth: '36px'
                          }}
                          onMouseOver={(e) => {
                            e.target.style.backgroundColor = '#fef2f2';
                            e.target.style.borderColor = '#f87171';
                          }}
                          onMouseOut={(e) => {
                            e.target.style.backgroundColor = 'transparent';
                            e.target.style.borderColor = '#fecaca';
                          }}
                        >
                          <Trash2 size={12} />
                        </button>

                        <button
                          onClick={() => {
                            setSelectedDriverDetail(driver);
                            setShowDetailModal(true);
                          }}
                          style={{
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minWidth: '60px'
                          }}
                          onMouseOver={(e) => {
                            e.target.style.backgroundColor = '#2563eb';
                          }}
                          onMouseOut={(e) => {
                            e.target.style.backgroundColor = '#3b82f6';
                          }}
                        >
                          📄 Details
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {showDetailModal && selectedDriverDetail && (
            <DriverDetailModal
              driver={selectedDriverDetail}
              onClose={() => {
                setShowDetailModal(false);
                setSelectedDriverDetail(null);
              }}
            />
          )}
        </div>
      )}

      {/* Mobile Summary */}
      {window.innerWidth < 640 && (
        <div style={{ marginTop: '16px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
            textAlign: 'center'
          }}>
            <div style={{
              backgroundColor: '#f0fdf4',
              padding: '12px',
              borderRadius: '8px'
            }}>
              <div style={{
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#16a34a'
              }}>
                {drivers.filter(d => d.isVerified).length}
              </div>
              <div style={{ fontSize: '12px', color: '#15803d' }}>Verified</div>
            </div>
            <div style={{
              backgroundColor: '#fef2f2',
              padding: '12px',
              borderRadius: '8px'
            }}>
              <div style={{
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#dc2626'
              }}>
                {drivers.filter(d => !d.isVerified).length}
              </div>
              <div style={{ fontSize: '12px', color: '#b91c1c' }}>Pending</div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default DriversTable;