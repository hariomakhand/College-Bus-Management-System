import React, { useState } from 'react';

const AssignmentModal = ({ 
  isOpen, 
  onClose, 
  driver, 
  buses, 
  routes, 
  onAssignBus, 
  onAssignRoute 
}) => {
  const [selectedBus, setSelectedBus] = useState('');
  const [selectedRoute, setSelectedRoute] = useState('');

  if (!isOpen) return null;

  const availableBuses = buses?.filter(bus => !bus.driverId && bus.status === 'active') || [];
  const availableRoutes = routes?.filter(route => route.status === 'active') || [];

  const handleAssign = async () => {
    try {
      if (selectedBus) {
        await onAssignBus(driver._id, selectedBus, selectedRoute);
      }
      onClose();
      setSelectedBus('');
      setSelectedRoute('');
    } catch (error) {
      console.error('Assignment error:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h3 className="text-lg font-bold mb-4">
          Assign Bus & Route to {driver?.name}
        </h3>
        
        <div className="space-y-4">
          {/* Bus Assignment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assign Bus
            </label>
            <select
              value={selectedBus}
              onChange={(e) => setSelectedBus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a bus...</option>
              {availableBuses.map((bus) => (
                <option key={bus._id} value={bus._id}>
                  {bus.busNumber} - {bus.model} ({bus.capacity} seats)
                </option>
              ))}
            </select>
            {availableBuses.length === 0 && (
              <p className="text-sm text-red-500 mt-1 font-medium">⚠️ No unassigned buses available</p>
            )}
          </div>

          {/* Route Assignment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assign Route
            </label>
            <select
              value={selectedRoute}
              onChange={(e) => setSelectedRoute(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a route...</option>
              {availableRoutes.map((route) => (
                <option key={route._id} value={route._id}>
                  {route.routeName} - {route.startPoint} → {route.endPoint} ({route.distance}km)
                </option>
              ))}
            </select>
            {availableRoutes.length === 0 && (
              <p className="text-sm text-gray-500 mt-1">No available routes</p>
            )}
          </div>

          {/* Current Assignments */}
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <h4 className="text-sm font-semibold text-blue-800 mb-2">📋 Current Status:</h4>
            <div className="text-sm">
              <p className={driver?.assignedBus ? 'text-green-700 font-medium' : 'text-red-600'}>
                🚌 Bus: {driver?.assignedBus?.busNumber || '❌ Not Assigned'}
              </p>
              <p className="text-gray-600">
                🗺️ Route: Will be assigned with bus
              </p>
            </div>
          </div>
        </div>

        <div className="flex space-x-3 mt-6">
          <button
            onClick={handleAssign}
            disabled={!selectedBus}
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {selectedBus ? '✅ Assign Bus & Route' : '⚠️ Select Bus First'}
          </button>
          <button
            onClick={() => {
              onClose();
              setSelectedBus('');
              setSelectedRoute('');
            }}
            className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignmentModal;