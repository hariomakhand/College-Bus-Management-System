import React, { useState } from 'react';
import { 
  useGetPendingRegistrationsQuery,
  useGetBusRequestsQuery,
  useHandleStudentRegistrationMutation,
  useHandleBusRequestMutation,
  useUpdateStudentStatusMutation,
  useUpdateStudentBusAssignmentMutation,
  useSendAnnouncementMutation,
  useGetStudentsQuery,
  useGetBusesQuery
} from '../store/apiSlice';
import { 
  User, Clock, CheckCircle, XCircle, Bus, MapPin, 
  AlertTriangle, MessageSquare, Send, Users
} from 'lucide-react';

const AdminStudentManagement = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [announcement, setAnnouncement] = useState({ title: '', message: '', type: 'info' });

  const { data: pendingRegistrations = [] } = useGetPendingRegistrationsQuery();
  const { data: busRequests = [] } = useGetBusRequestsQuery();
  const { data: students = [] } = useGetStudentsQuery();
  const { data: buses = [] } = useGetBusesQuery();
  
  // Debug log to check student data
  console.log('Students data:', students);
  console.log('Buses data:', buses);
  
  const [handleRegistration] = useHandleStudentRegistrationMutation();
  const [handleBusRequest] = useHandleBusRequestMutation();
  const [updateStudentStatus] = useUpdateStudentStatusMutation();
  const [updateStudentBusAssignment] = useUpdateStudentBusAssignmentMutation();
  const [sendAnnouncement] = useSendAnnouncementMutation();

  const handleStudentApproval = async (studentId, action, reason = '') => {
    try {
      await handleRegistration({ studentId, action, reason }).unwrap();
      alert(`Student ${action}d successfully!`);
    } catch (error) {
      alert('Error: ' + error.data?.message);
    }
  };

  const handleBusApproval = async (studentId, action, busId = null, reason = '') => {
    try {
      await handleBusRequest({ studentId, action, busId, reason }).unwrap();
      alert(`Bus request ${action}d successfully!`);
    } catch (error) {
      alert('Error: ' + error.data?.message);
    }
  };

  const handleStatusUpdate = async (studentId, status, reason = '') => {
    try {
      await updateStudentStatus({ studentId, status, reason }).unwrap();
      alert(`Student status updated to ${status}!`);
    } catch (error) {
      alert('Error: ' + error.data?.message);
    }
  };

  const handleBusReassignment = async (studentId, newBusId) => {
    try {
      await updateStudentBusAssignment({ studentId, busId: newBusId }).unwrap();
      alert('Bus reassigned successfully!');
    } catch (error) {
      alert('Error: ' + error.data?.message);
    }
  };

  const handleAnnouncementSend = async (e) => {
    e.preventDefault();
    try {
      await sendAnnouncement(announcement).unwrap();
      alert('Announcement sent successfully!');
      setAnnouncement({ title: '', message: '', type: 'info' });
    } catch (error) {
      alert('Error: ' + error.data?.message);
    }
  };

  const tabs = [
    { id: 'pending', name: 'Pending Registrations', count: pendingRegistrations.length },
    { id: 'busRequests', name: 'Bus Requests', count: busRequests.length },
    { id: 'students', name: 'All Students', count: students.length },
    { id: 'announcements', name: 'Announcements', count: 0 }
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-full overflow-hidden">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Student Management</h2>
      
      {/* Tabs */}
      <div className="border-b border-gray-200 overflow-hidden">
        <nav className="-mb-px flex space-x-2 sm:space-x-8 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-2 sm:px-4 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap flex-shrink-0 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="hidden sm:inline">{tab.name}</span>
              <span className="sm:hidden">
                {tab.id === 'pending' ? 'Pending' :
                 tab.id === 'busRequests' ? 'Bus Req' :
                 tab.id === 'students' ? 'Students' : 'Announce'}
              </span>
              {tab.count > 0 && (
                <span className="ml-1 sm:ml-2 bg-red-100 text-red-600 py-0.5 px-1 sm:px-2 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Pending Registrations */}
      {activeTab === 'pending' && (
        <div className="space-y-3 sm:space-y-4">
          {pendingRegistrations.length > 0 ? (
            pendingRegistrations.map((student) => (
              <div key={student._id} className="bg-white rounded-lg shadow-sm border p-3 sm:p-6">
                <div className="flex flex-col gap-3 sm:gap-4">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="text-blue-600" size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{student.name}</h3>
                      <p className="text-gray-600 text-sm truncate">{student.email}</p>
                      <div className="mt-1 space-y-0.5">
                        <p className="text-xs sm:text-sm text-gray-500">ID: {student.studentId}</p>
                        <p className="text-xs sm:text-sm text-gray-500">Dept: {student.department}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <button
                      onClick={() => handleStudentApproval(student._id, 'approve')}
                      className="bg-green-600 text-white px-4 py-2.5 sm:py-2 rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2 transition-colors text-sm font-medium"
                    >
                      <CheckCircle size={16} />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => {
                        const reason = prompt('Enter rejection reason:');
                        if (reason) handleStudentApproval(student._id, 'reject', reason);
                      }}
                      className="bg-red-600 text-white px-4 py-2.5 sm:py-2 rounded-lg hover:bg-red-700 flex items-center justify-center space-x-2 transition-colors text-sm font-medium"
                    >
                      <XCircle size={16} />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 sm:py-12 text-gray-500">
              <Users size={40} className="mx-auto mb-3 opacity-50" />
              <p className="text-sm sm:text-base">No pending registrations</p>
            </div>
          )}
        </div>
      )}

      {/* Bus Requests */}
      {activeTab === 'busRequests' && (
        <div className="space-y-3 sm:space-y-4">
          {busRequests.length > 0 ? (
            busRequests.map((student) => (
              <div key={student._id} className="bg-white rounded-lg shadow-sm border p-3 sm:p-6">
                <div className="flex flex-col gap-3 sm:gap-4">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bus className="text-yellow-600" size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{student.name}</h3>
                      <p className="text-gray-600 text-sm truncate">{student.email}</p>
                      <div className="mt-1 space-y-0.5">
                        <p className="text-xs sm:text-sm text-gray-500">Route: {student.appliedRouteId?.routeName}</p>
                        <p className="text-xs sm:text-sm text-gray-500">Pickup: {student.preferredPickupStop}</p>
                        <p className="text-xs sm:text-sm text-gray-500">Reason: {student.applicationReason}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <select
                        id={`bus-select-${student._id}`}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        defaultValue=""
                      >
                        <option value="">Select Bus to Assign</option>
                        {buses.filter(bus => 
                          bus.status === 'active' && 
                          !bus.isDeleted &&
                          bus.routeId?._id === student.appliedRouteId?._id
                        ).map(bus => (
                          <option key={bus._id} value={bus._id}>
                            {bus.busNumber} - {bus.model}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => {
                          const selectElement = document.getElementById(`bus-select-${student._id}`);
                          const selectedBusId = selectElement.value;
                          if (selectedBusId) {
                            handleBusApproval(student._id, 'approve', selectedBusId);
                          } else {
                            alert('Please select a bus first');
                          }
                        }}
                        className="bg-green-600 text-white px-4 py-2.5 rounded-lg text-sm hover:bg-green-700 transition-colors font-medium flex items-center justify-center space-x-2"
                      >
                        <CheckCircle size={16} />
                        <span>Accept</span>
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        const reason = prompt('Enter rejection reason:');
                        if (reason) handleBusApproval(student._id, 'reject', null, reason);
                      }}
                      className="bg-red-600 text-white px-4 py-2.5 rounded-lg text-sm hover:bg-red-700 transition-colors font-medium flex items-center justify-center space-x-2"
                    >
                      <XCircle size={16} />
                      <span>Reject Request</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 sm:py-12 text-gray-500">
              <Bus size={40} className="mx-auto mb-3 opacity-50" />
              <p className="text-sm sm:text-base">No pending bus requests</p>
            </div>
          )}
        </div>
      )}

      {/* All Students */}
      {activeTab === 'students' && (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bus</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((student) => (
                  <tr key={student._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="text-blue-600" size={20} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{student.name}</div>
                          <div className="text-sm text-gray-500">{student.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        student.status === 'active' ? 'bg-green-100 text-green-800' :
                        student.status === 'suspended' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {student.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.busId ? `Bus ${student.busId.busNumber}` : 'Not Assigned'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <select
                        onChange={(e) => {
                          if (e.target.value && e.target.value !== student.status) {
                            const reason = e.target.value !== 'active' ? prompt('Enter reason:') : '';
                            if (e.target.value === 'active' || reason) {
                              handleStatusUpdate(student._id, e.target.value, reason);
                            }
                          }
                        }}
                        value={student.status}
                        className="border border-gray-300 rounded px-2 py-1"
                      >
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                        <option value="blocked">Blocked</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {students.map((student) => (
              <div key={student._id} className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="text-blue-600" size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{student.name}</div>
                    <div className="text-sm text-gray-500">{student.email}</div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    student.status === 'active' ? 'bg-green-100 text-green-800' :
                    student.status === 'suspended' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {student.status}
                  </span>
                </div>
                
                <div className="space-y-2 mb-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Bus:</span>
                    <span className="font-medium">
                      {student.busId ? `Bus ${student.busId.busNumber}` : 'Not Assigned'}
                    </span>
                  </div>
                </div>
                
                <select
                  onChange={(e) => {
                    if (e.target.value && e.target.value !== student.status) {
                      const reason = e.target.value !== 'active' ? prompt('Enter reason:') : '';
                      if (e.target.value === 'active' || reason) {
                        handleStatusUpdate(student._id, e.target.value, reason);
                      }
                    }
                  }}
                  value={student.status}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                >
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Announcements */}
      {activeTab === 'announcements' && (
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Send Announcement</h3>
          <form onSubmit={handleAnnouncementSend} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={announcement.title}
                onChange={(e) => setAnnouncement({...announcement, title: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea
                rows={4}
                value={announcement.message}
                onChange={(e) => setAnnouncement({...announcement, message: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={announcement.type}
                onChange={(e) => setAnnouncement({...announcement, type: e.target.value})}
                className="w-full sm:w-auto border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="success">Success</option>
                <option value="error">Error</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2 transition-colors"
            >
              <Send size={16} />
              <span>Send Announcement</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminStudentManagement;