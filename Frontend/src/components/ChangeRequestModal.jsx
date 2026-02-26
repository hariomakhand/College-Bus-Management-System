import React, { useState, useEffect } from 'react';
import { Route as RouteIcon, MapPin, X } from 'lucide-react';
import { studentAPI } from '../Api';
import { parseStops } from '../utils/parseStops';

const ChangeRequestModal = ({ student, onClose, onSuccess }) => {
  const [routes, setRoutes] = useState([]);
  const [changeType, setChangeType] = useState('');
  const [selectedRoute, setSelectedRoute] = useState('');
  const [selectedStop, setSelectedStop] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      const response = await studentAPI.getRoutes();
      console.log('Routes fetched for change request:', response.data);
      setRoutes(response.data.routes || []);
    } catch (error) {
      console.error('Error fetching routes:', error);
    }
  };

  const currentRoute = routes.find(r => r._id === student?.appliedRouteId);
  const selectedRouteData = routes.find(r => r._id === selectedRoute);
  
  const stops = selectedRouteData ? parseStops(selectedRouteData.stops) : [];
  const currentStops = currentRoute ? parseStops(currentRoute.stops) : [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        newRouteId: changeType === 'route' ? selectedRoute : student.appliedRouteId,
        newPickupStop: selectedStop,
        reason
      };

      const response = await studentAPI.requestRouteChange(payload);
      alert(response.data.message || 'Change request submitted successfully!');
      onSuccess();
      onClose();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900">Request Route/Stop Change</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Change Type</label>
            <select
              value={changeType}
              onChange={(e) => {
                setChangeType(e.target.value);
                setSelectedRoute('');
                setSelectedStop('');
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
              required
            >
              <option value="">Select change type</option>
              <option value="route">Change Route</option>
              <option value="stop">Change Stop Only</option>
            </select>
          </div>

          {changeType === 'route' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <RouteIcon className="inline mr-1" size={16} />
                Select New Route
              </label>
              <select
                value={selectedRoute}
                onChange={(e) => {
                  setSelectedRoute(e.target.value);
                  setSelectedStop('');
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                required
              >
                <option value="">Choose a route</option>
                {routes.filter(r => r._id !== student?.appliedRouteId).map(route => (
                  <option key={route._id} value={route._id}>
                    {route.routeName} ({route.startPoint} → {route.endPoint})
                  </option>
                ))}
              </select>
            </div>
          )}

          {((changeType === 'route' && selectedRoute) || changeType === 'stop') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline mr-1" size={16} />
                Select {changeType === 'route' ? 'New' : 'Different'} Stop
              </label>
              <select
                value={selectedStop}
                onChange={(e) => setSelectedStop(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                required
              >
                <option value="">Choose a stop</option>
                {(changeType === 'stop' ? currentStops : stops)
                  .filter(stop => stop.name && stop.name !== student?.preferredPickupStop)
                  .map((stop, idx) => (
                    <option key={idx} value={stop.name}>
                      {stop.name}{stop.time && stop.time !== 'N/A' ? ` - ${stop.time}` : ''}
                    </option>
                  ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Change</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
              placeholder="Why do you need this change?"
              required
            />
          </div>

          <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600">
            <p><strong>Current Route:</strong> {currentRoute?.routeName || 'N/A'}</p>
            <p><strong>Current Stop:</strong> {student?.preferredPickupStop || 'N/A'}</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-600 text-white py-3 rounded-lg hover:bg-yellow-700 font-semibold disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Change Request'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangeRequestModal;
