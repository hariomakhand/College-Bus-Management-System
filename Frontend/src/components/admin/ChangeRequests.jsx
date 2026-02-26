import React, { useState } from 'react';
import { useGetChangeRequestsQuery, useHandleChangeRequestMutation, useGetBusesQuery } from '../../store/apiSlice';
import { RefreshCw, CheckCircle, XCircle, Clock, MapPin, User } from 'lucide-react';

const ChangeRequests = () => {
  const { data: requests = [], isLoading, refetch } = useGetChangeRequestsQuery();
  const { data: buses = [] } = useGetBusesQuery();
  const [handleRequest, { isLoading: handling }] = useHandleChangeRequestMutation();
  const [selectedBus, setSelectedBus] = useState({});
  const [adminResponse, setAdminResponse] = useState({});

  const handleApprove = async (studentId) => {
    const busId = selectedBus[studentId];
    const response = adminResponse[studentId] || '';

    if (!busId) {
      alert('Please select a bus for the student');
      return;
    }

    try {
      await handleRequest({
        studentId,
        action: 'approve',
        busId,
        adminResponse: response
      }).unwrap();
      alert('Change request approved successfully!');
      refetch();
    } catch (error) {
      alert('Failed to approve: ' + (error.data?.message || error.message));
    }
  };

  const handleReject = async (studentId) => {
    const response = adminResponse[studentId];
    if (!response) {
      alert('Please provide a reason for rejection');
      return;
    }

    try {
      await handleRequest({
        studentId,
        action: 'reject',
        adminResponse: response
      }).unwrap();
      alert('Change request rejected');
      refetch();
    } catch (error) {
      alert('Failed to reject: ' + (error.data?.message || error.message));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Change Requests</h2>
        <button
          onClick={refetch}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <Clock size={64} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Pending Requests</h3>
          <p className="text-gray-600">All change requests have been processed</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {requests.map((student) => (
            <div key={student._id} className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Student Info */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <User className="text-blue-600" size={24} />
                    <div>
                      <h3 className="font-bold text-gray-900">{student.name}</h3>
                      <p className="text-sm text-gray-600">{student.email}</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Student ID:</span> {student.studentId}</p>
                    <p><span className="font-medium">Phone:</span> {student.phone}</p>
                    <p><span className="font-medium">Department:</span> {student.department}</p>
                  </div>
                </div>

                {/* Change Details */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <MapPin size={18} className="text-yellow-600" />
                    Change Request Details
                  </h4>
                  <div className="space-y-3">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Request Type</p>
                      <p className="font-medium text-gray-900 capitalize">{student.changeRequest.type}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Current Route</p>
                      <p className="font-medium text-gray-900">{student.appliedRouteId?.routeName || 'N/A'}</p>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                      <p className="text-xs text-gray-600 mb-1">New Route</p>
                      <p className="font-medium text-gray-900">{student.changeRequest.newRouteId?.routeName || 'N/A'}</p>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                      <p className="text-xs text-gray-600 mb-1">New Pickup Stop</p>
                      <p className="font-medium text-gray-900">{student.changeRequest.newPickupStop}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Reason</p>
                      <p className="text-sm text-gray-900">{student.changeRequest.reason}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Requested On</p>
                      <p className="text-sm text-gray-900">
                        {new Date(student.changeRequest.requestDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Admin Actions</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Assign Bus
                      </label>
                      <select
                        value={selectedBus[student._id] || ''}
                        onChange={(e) => setSelectedBus({ ...selectedBus, [student._id]: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Bus</option>
                        {buses
                          .filter(bus => bus.routeId?._id === student.changeRequest.newRouteId?._id)
                          .map(bus => (
                            <option key={bus._id} value={bus._id}>
                              {bus.busNumber} - {bus.model}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Admin Response
                      </label>
                      <textarea
                        value={adminResponse[student._id] || ''}
                        onChange={(e) => setAdminResponse({ ...adminResponse, [student._id]: e.target.value })}
                        placeholder="Add a message for the student..."
                        rows={3}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(student._id)}
                        disabled={handling}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <CheckCircle size={16} />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(student._id)}
                        disabled={handling}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <XCircle size={16} />
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChangeRequests;
