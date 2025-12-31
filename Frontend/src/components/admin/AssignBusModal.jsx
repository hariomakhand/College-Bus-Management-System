import React from 'react';

const AssignBusModal = ({ 
  assignModal, 
  selectedDriver, 
  formData, 
  setFormData, 
  buses, 
  routes, 
  handleAssignBus, 
  setAssignModal, 
  setSelectedDriver 
}) => {
  if (!assignModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Assign Bus to {selectedDriver?.name}</h3>
        <form onSubmit={handleAssignBus} className="space-y-4">
          <select
            value={formData.busId || ''}
            onChange={(e) => setFormData({...formData, busId: e.target.value})}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Select Bus</option>
            {buses.filter(bus => !bus.driverId).map(bus => (
              <option key={bus._id} value={bus._id}>
                {bus.busNumber} - {bus.model} (Capacity: {bus.capacity})
              </option>
            ))}
          </select>
          <select
            value={formData.routeId || ''}
            onChange={(e) => setFormData({...formData, routeId: e.target.value})}
            className="w-full p-2 border rounded"
          >
            <option value="">Select Route (Optional)</option>
            {routes.map(route => (
              <option key={route._id} value={route._id}>
                {route.routeName} - {route.routeNumber}
              </option>
            ))}
          </select>
          <div className="flex space-x-2">
            <button type="submit" className="flex-1 bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
              Assign Bus
            </button>
            <button 
              type="button" 
              onClick={() => {setAssignModal(false); setFormData({}); setSelectedDriver(null);}}
              className="flex-1 bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignBusModal;