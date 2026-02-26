import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Navigation, Send } from 'lucide-react';
import { studentAPI } from '../Api';

const RouteApplicationForm = ({ onSuccess }) => {
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [pickupStop, setPickupStop] = useState('');
  const [customStop, setCustomStop] = useState({ name: '', lat: '', lng: '' });
  const [reason, setReason] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [isNewStop, setIsNewStop] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      const response = await studentAPI.getRoutes();
      console.log('Routes fetched:', response.data);
      setRoutes(response.data.routes || []);
    } catch (error) {
      console.error('Error fetching routes:', error);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCustomStop(prev => ({
            ...prev,
            lat: position.coords.latitude.toFixed(6),
            lng: position.coords.longitude.toFixed(6)
          }));
        },
        (error) => alert('Unable to get location: ' + error.message)
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        routeId: selectedRoute._id,
        pickupStop: isNewStop ? {
          name: customStop.name,
          coordinates: {
            lat: parseFloat(customStop.lat),
            lng: parseFloat(customStop.lng)
          }
        } : { name: pickupStop },
        reason
      };

      const response = await studentAPI.applyForBus(payload);
      
      if (response.data.data?.pickupStop?.estimatedTime) {
        setEstimatedTime(response.data.data.pickupStop.estimatedTime);
      }
      
      alert(response.data.message || 'Application submitted successfully!');
      if (onSuccess) onSuccess();
      resetForm();
    } catch (error) {
      alert(error.response?.data?.message || 'Application failed');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedRoute(null);
    setPickupStop('');
    setCustomStop({ name: '', lat: '', lng: '' });
    setReason('');
    setIsNewStop(false);
    setEstimatedTime('');
  };

  const stops = selectedRoute ? (() => {
    try {
      // Try parsing as JSON first
      return JSON.parse(selectedRoute.stops || '[]');
    } catch (e) {
      // If not JSON, treat as comma-separated string
      const stopsStr = selectedRoute.stops || '';
      return stopsStr.split(',').map(stop => ({
        name: stop.trim(),
        time: 'TBD'
      })).filter(stop => stop.name);
    }
  })() : [];

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
        <Navigation className="mr-3 text-yellow-600" size={28} />
        Apply for Bus Route
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Route</label>
          <select
            value={selectedRoute?._id || ''}
            onChange={(e) => setSelectedRoute(routes.find(r => r._id === e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
            required
          >
            <option value="">Choose a route</option>
            {routes.map(route => (
              <option key={route._id} value={route._id}>
                {route.routeName} ({route.startPoint} → {route.endPoint})
              </option>
            ))}
          </select>
        </div>

        {selectedRoute && (
          <>
            <div>
              <label className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={isNewStop}
                  onChange={(e) => setIsNewStop(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">My stop is not in the list</span>
              </label>
            </div>

            {!isNewStop ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="inline mr-1" size={16} />
                  Select Pickup Stop
                </label>
                <select
                  value={pickupStop}
                  onChange={(e) => setPickupStop(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                  required
                >
                  <option value="">Choose your stop</option>
                  {stops.map((stop, idx) => (
                    <option key={idx} value={stop.name}>
                      {stop.name} - {stop.time}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-4 p-4 bg-yellow-50 rounded-lg">
                <h3 className="font-semibold text-gray-800">Add New Stop</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stop Name</label>
                  <input
                    type="text"
                    value={customStop.name}
                    onChange={(e) => setCustomStop({ ...customStop, name: e.target.value })}
                    placeholder="e.g., Main Gate, College Road"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      value={customStop.lat}
                      onChange={(e) => setCustomStop({ ...customStop, lat: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      value={customStop.lng}
                      onChange={(e) => setCustomStop({ ...customStop, lng: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={getCurrentLocation}
                  className="w-full bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 flex items-center justify-center"
                >
                  <Navigation className="mr-2" size={18} />
                  Use My Current Location
                </button>

                {estimatedTime && (
                  <div className="bg-green-100 p-3 rounded-lg">
                    <Clock className="inline mr-2 text-green-600" size={18} />
                    <span className="font-semibold text-green-800">
                      Estimated Bus Time: {estimatedTime}
                    </span>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Application</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows="3"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
            placeholder="Why do you need this bus service?"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-yellow-600 text-white py-3 rounded-lg hover:bg-yellow-700 font-semibold flex items-center justify-center disabled:opacity-50"
        >
          <Send className="mr-2" size={20} />
          {loading ? 'Submitting...' : 'Submit Application'}
        </button>
      </form>
    </div>
  );
};

export default RouteApplicationForm;
