import React, { useState } from 'react';
import { X, Bus, MapPin, User, CheckCircle, AlertTriangle } from 'lucide-react';

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
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const availableBuses = buses?.filter(bus => !bus.driverId && bus.status === 'active') || [];
  const availableRoutes = routes?.filter(route => route.status === 'active') || [];

  const handleAssign = async () => {
    if (!selectedBus) return;
    
    setLoading(true);
    try {
      await onAssignBus(driver._id, selectedBus, selectedRoute);
      onClose();
      setSelectedBus('');
      setSelectedRoute('');
    } catch (error) {
      console.error('Assignment error:', error);
      alert('Assignment failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="text-blue-600" size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Assign Resources</h3>
              <p className="text-sm text-gray-500">Driver: {driver?.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Current Status */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
              <CheckCircle className="mr-2" size={16} />
              Current Assignment Status
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center ${
                  driver?.assignedBus ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  <Bus className={driver?.assignedBus ? 'text-green-600' : 'text-red-600'} size={20} />
                </div>
                <p className="text-sm font-medium text-gray-900">
                  {driver?.assignedBus?.busNumber || 'No Bus'}
                </p>
                <p className="text-xs text-gray-500">
                  {driver?.assignedBus ? 'Assigned' : 'Not Assigned'}
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 bg-gray-100 rounded-full flex items-center justify-center">
                  <MapPin className="text-gray-600" size={20} />
                </div>
                <p className="text-sm font-medium text-gray-900">Route</p>
                <p className="text-xs text-gray-500">With Bus</p>
              </div>
            </div>
          </div>

          {/* Bus Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">
              <Bus className="inline mr-2" size={16} />
              Select Bus
            </label>
            <select
              value={selectedBus}
              onChange={(e) => setSelectedBus(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="">Choose a bus...</option>
              {availableBuses.map((bus) => (
                <option key={bus._id} value={bus._id}>
                  🚌 {bus.busNumber} - {bus.model} ({bus.capacity} seats)
                </option>
              ))}
            </select>
            {availableBuses.length === 0 && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="text-red-500" size={16} />
                <p className="text-sm text-red-700 font-medium">No available buses found</p>
              </div>
            )}
          </div>

          {/* Route Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">
              <MapPin className="inline mr-2" size={16} />
              Select Route (Optional)
            </label>
            <select
              value={selectedRoute}
              onChange={(e) => setSelectedRoute(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              disabled={!selectedBus}
            >
              <option value="">Choose a route...</option>
              {availableRoutes.map((route) => (
                <option key={route._id} value={route._id}>
                  🗺️ {route.routeName} - {route.startPoint} → {route.endPoint} ({route.distance}km)
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500">
              Route assignment is optional and can be done later
            </p>
          </div>

          {/* Assignment Preview */}
          {selectedBus && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <h4 className="font-semibold text-green-900 mb-2 flex items-center">
                <CheckCircle className="mr-2" size={16} />
                Assignment Preview
              </h4>
              <div className="space-y-2 text-sm">
                <p className="text-green-800">
                  <strong>Driver:</strong> {driver?.name}
                </p>
                <p className="text-green-800">
                  <strong>Bus:</strong> {availableBuses.find(b => b._id === selectedBus)?.busNumber}
                </p>
                {selectedRoute && (
                  <p className="text-green-800">
                    <strong>Route:</strong> {availableRoutes.find(r => r._id === selectedRoute)?.routeName}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex space-x-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <button
            onClick={handleAssign}
            disabled={!selectedBus || loading}
            className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-6 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Assigning...</span>
              </>
            ) : (
              <>
                <CheckCircle size={16} />
                <span>{selectedBus ? 'Assign Resources' : 'Select Bus First'}</span>
              </>
            )}
          </button>
          <button
            onClick={() => {
              onClose();
              setSelectedBus('');
              setSelectedRoute('');
            }}
            disabled={loading}
            className="flex-1 bg-gray-500 text-white py-3 px-6 rounded-xl font-semibold hover:bg-gray-600 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignmentModal;