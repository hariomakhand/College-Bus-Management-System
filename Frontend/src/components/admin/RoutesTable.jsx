import React from 'react';
import { MapPin, Plus, Loader2, Trash2, Navigation, Clock, Users } from 'lucide-react';

const RoutesTable = ({ 
  routes, 
  loading, 
  setShowModal, 
  setModalType, 
  deleteUser 
}) => {
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
            background: '#eab308',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <MapPin size={20} style={{ color: '#1f2937' }} />
          </div>
          <div>
            <h3 style={{
              fontSize: window.innerWidth < 640 ? '18px' : '20px',
              fontWeight: 'bold',
              color: '#1f2937',
              margin: 0
            }}>
              Route Management
            </h3>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
              Total: {routes.length} routes
            </p>
          </div>
        </div>

        {/* Right Side - Add Button */}
        <button
          onClick={() => {setShowModal(true); setModalType('route');}}
          style={{
            background: '#eab308',
            color: '#1f2937',
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
            e.target.style.backgroundColor = '#ca8a04';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = '#eab308';
          }}
        >
          <Plus size={16} />
          {window.innerWidth < 640 ? 'Add Route' : 'Add New Route'}
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
            color: '#eab308',
            animation: 'spin 1s linear infinite'
          }} />
          <span style={{ marginLeft: '12px', color: '#6b7280' }}>Loading routes...</span>
        </div>
      ) : routes.length === 0 ? (
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
            <MapPin size={32} style={{ color: '#9ca3af' }} />
          </div>
          <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
            No routes found
          </h4>
          <p style={{ color: '#6b7280' }}>Add your first route to get started</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{
                background: 'linear-gradient(135deg, #fef9c3 0%, #fde68a 100%)',
                borderBottom: '2px solid #fbbf24'
              }}>
                <th style={{
                  textAlign: 'left',
                  padding: window.innerWidth < 640 ? '12px' : '16px',
                  fontWeight: '600',
                  color: '#374151',
                  minWidth: '140px'
                }}>Route Information</th>
                <th style={{
                  textAlign: 'left',
                  padding: window.innerWidth < 640 ? '12px' : '16px',
                  fontWeight: '600',
                  color: '#374151',
                  display: window.innerWidth < 640 ? 'none' : 'table-cell'
                }}>Route Points</th>
                <th style={{
                  textAlign: 'left',
                  padding: window.innerWidth < 640 ? '12px' : '16px',
                  fontWeight: '600',
                  color: '#374151'
                }}>Distance & Time</th>
                <th style={{
                  textAlign: 'left',
                  padding: window.innerWidth < 640 ? '12px' : '16px',
                  fontWeight: '600',
                  color: '#374151',
                  display: window.innerWidth < 768 ? 'none' : 'table-cell'
                }}>Stops</th>
                <th style={{
                  textAlign: 'left',
                  padding: window.innerWidth < 640 ? '12px' : '16px',
                  fontWeight: '600',
                  color: '#374151',
                  display: window.innerWidth < 1024 ? 'none' : 'table-cell'
                }}>Status</th>
                <th style={{
                  textAlign: 'center',
                  padding: window.innerWidth < 640 ? '12px' : '16px',
                  fontWeight: '600',
                  color: '#374151'
                }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {routes.map((route, index) => (
                <tr key={route._id} style={{
                  borderBottom: '1px solid #f3f4f6',
                  backgroundColor: index % 2 === 0 ? 'white' : '#f9fafb',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#fef3c7';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'white' : '#f9fafb';
                }}>
                  <td style={{ padding: window.innerWidth < 640 ? '12px' : '16px' }}>
                    <div style={{ fontWeight: '600', color: '#1f2937' }}>{route.routeName}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      {route.routeNumber && `#${route.routeNumber}`}
                    </div>
                    {window.innerWidth < 640 && (
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        {route.distance}km • {route.estimatedTime}min
                      </div>
                    )}
                  </td>
                  
                  <td style={{
                    padding: window.innerWidth < 640 ? '12px' : '16px',
                    color: '#6b7280',
                    display: window.innerWidth < 640 ? 'none' : 'table-cell'
                  }}>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>{route.startPoint}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>↓</div>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>{route.endPoint}</div>
                  </td>
                  
                  <td style={{ padding: window.innerWidth < 640 ? '12px' : '16px' }}>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>{route.distance} km</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>{route.estimatedTime} minutes</div>
                  </td>
                  
                  <td style={{
                    padding: window.innerWidth < 640 ? '12px' : '16px',
                    color: '#6b7280',
                    display: window.innerWidth < 768 ? 'none' : 'table-cell'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Users size={12} style={{ color: '#eab308' }} />
                      <span style={{ fontSize: '12px', fontWeight: '500', color: '#1f2937' }}>
                        {route.stops ? route.stops.split(',').filter(s => s.trim()).length : 0} stops
                      </span>
                    </div>
                  </td>
                  
                  <td style={{
                    padding: window.innerWidth < 640 ? '12px' : '16px',
                    display: window.innerWidth < 1024 ? 'none' : 'table-cell'
                  }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '500',
                      backgroundColor: route.status === 'active' ? '#fde68a' : '#d1d5db',
                      color: route.status === 'active' ? '#78350f' : '#4b5563'
                    }}>
                      {route.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  
                  <td style={{ padding: window.innerWidth < 640 ? '12px' : '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <button
                        onClick={() => deleteUser('routes', route._id)}
                        style={{
                          color: '#6b7280',
                          backgroundColor: 'transparent',
                          border: '1px solid #d1d5db',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: '500',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          minWidth: '70px',
                          justifyContent: 'center'
                        }}
                        onMouseOver={(e) => {
                          e.target.style.backgroundColor = '#f3f4f6';
                          e.target.style.borderColor = '#9ca3af';
                        }}
                        onMouseOut={(e) => {
                          e.target.style.backgroundColor = 'transparent';
                          e.target.style.borderColor = '#d1d5db';
                        }}
                        title="Delete Route"
                      >
                        <Trash2 size={12} />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Mobile Summary */}
      {window.innerWidth < 640 && routes.length > 0 && (
        <div style={{ marginTop: '16px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px',
            textAlign: 'center'
          }}>
            <div style={{
              backgroundColor: '#fef3c7',
              padding: '12px',
              borderRadius: '8px'
            }}>
              <div style={{
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#78350f'
              }}>
                {routes.filter(r => r.status === 'active').length}
              </div>
              <div style={{ fontSize: '11px', color: '#92400e' }}>Active Routes</div>
            </div>
            <div style={{
              backgroundColor: '#f3f4f6',
              padding: '12px',
              borderRadius: '8px'
            }}>
              <div style={{
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#4b5563'
              }}>
                {routes.reduce((total, route) => total + (route.stops ? route.stops.split(',').filter(s => s.trim()).length : 0), 0)}
              </div>
              <div style={{ fontSize: '11px', color: '#6b7280' }}>Total Stops</div>
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

export default RoutesTable;