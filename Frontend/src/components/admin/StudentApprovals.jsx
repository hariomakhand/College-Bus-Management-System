import React from 'react';
import { UserCheck, Clock, CheckCircle, XCircle, Bus, MapPin } from 'lucide-react';
import { 
  useGetPendingRegistrationsQuery, 
  useGetBusRequestsQuery,
  useHandleStudentRegistrationMutation,
  useHandleBusRequestMutation 
} from '../../store/apiSlice';

const StudentApprovals = () => {
  const { data: pendingRegistrations = [], isLoading: loadingRegistrations } = useGetPendingRegistrationsQuery();
  const { data: busRequests = [], isLoading: loadingRequests } = useGetBusRequestsQuery();
  const [handleRegistration] = useHandleStudentRegistrationMutation();
  const [handleBusRequest] = useHandleBusRequestMutation();

  const handleRegistrationAction = async (studentId, action, reason = '') => {
    try {
      await handleRegistration({ studentId, action, reason }).unwrap();
      alert(`Student registration ${action}d successfully!`);
    } catch (error) {
      alert(`Failed to ${action} registration: ${error.data?.message || error.message}`);
    }
  };

  const handleBusRequestAction = async (studentId, action, busId = null, reason = '') => {
    try {
      await handleBusRequest({ studentId, action, busId, reason }).unwrap();
      alert(`Bus request ${action}d successfully!`);
    } catch (error) {
      alert(`Failed to ${action} bus request: ${error.data?.message || error.message}`);
    }
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
        alignItems: 'center',
        gap: '12px',
        marginBottom: '24px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <UserCheck size={20} style={{ color: 'white' }} />
        </div>
        <div>
          <h3 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#1f2937',
            margin: 0
          }}>
            Student Approvals
          </h3>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
            Manage student registrations and bus applications
          </p>
        </div>
      </div>

      {/* Pending Registrations Section */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '16px'
        }}>
          <Clock size={18} style={{ color: '#f59e0b' }} />
          <h4 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#1f2937',
            margin: 0
          }}>
            Pending Student Registrations ({pendingRegistrations.length})
          </h4>
        </div>

        {loadingRegistrations ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
            Loading registrations...
          </div>
        ) : pendingRegistrations.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '20px',
            backgroundColor: '#f9fafb',
            borderRadius: '8px',
            color: '#6b7280'
          }}>
            No pending registrations
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '12px' }}>
            {pendingRegistrations.map((student) => (
              <div key={student._id} style={{
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '16px',
                backgroundColor: '#fefefe'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '16px'
                }}>
                  <div style={{ flex: 1 }}>
                    <h5 style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#1f2937',
                      margin: '0 0 8px 0'
                    }}>
                      {student.name}
                    </h5>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                      <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                        <strong>Email:</strong> {student.email}
                      </p>
                      <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                        <strong>Phone:</strong> {student.phone || 'N/A'}
                      </p>
                      <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                        <strong>Department:</strong> {student.department || 'N/A'}
                      </p>
                      <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                        <strong>Year:</strong> {student.year || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleRegistrationAction(student._id, 'approve')}
                      style={{
                        backgroundColor: '#10b981',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <CheckCircle size={14} />
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        const reason = prompt('Enter rejection reason:');
                        if (reason) handleRegistrationAction(student._id, 'reject', reason);
                      }}
                      style={{
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <XCircle size={14} />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bus Requests Section */}
      <div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '16px'
        }}>
          <Bus size={18} style={{ color: '#3b82f6' }} />
          <h4 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#1f2937',
            margin: 0
          }}>
            Pending Bus Applications ({busRequests.length})
          </h4>
        </div>

        {loadingRequests ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
            Loading bus requests...
          </div>
        ) : busRequests.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '20px',
            backgroundColor: '#f9fafb',
            borderRadius: '8px',
            color: '#6b7280'
          }}>
            No pending bus applications
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '12px' }}>
            {busRequests.map((student) => (
              <div key={student._id} style={{
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '16px',
                backgroundColor: '#fefefe'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '16px'
                }}>
                  <div style={{ flex: 1 }}>
                    <h5 style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#1f2937',
                      margin: '0 0 8px 0'
                    }}>
                      {student.name}
                    </h5>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                      <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                        <strong>Route:</strong> {student.appliedRouteId?.routeName || 'N/A'}
                      </p>
                      <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                        <strong>Pickup Stop:</strong> {student.preferredPickupStop || 'N/A'}
                      </p>
                      <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                        <strong>Application Date:</strong> {student.applicationDate ? new Date(student.applicationDate).toLocaleDateString() : 'N/A'}
                      </p>
                      <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                        <strong>Reason:</strong> {student.applicationReason || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => {
                        const busId = prompt('Enter Bus ID to assign (optional):');
                        handleBusRequestAction(student._id, 'approve', busId);
                      }}
                      style={{
                        backgroundColor: '#10b981',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <CheckCircle size={14} />
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        const reason = prompt('Enter rejection reason:');
                        if (reason) handleBusRequestAction(student._id, 'reject', null, reason);
                      }}
                      style={{
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <XCircle size={14} />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentApprovals;