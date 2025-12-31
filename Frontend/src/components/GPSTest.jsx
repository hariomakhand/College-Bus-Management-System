import React, { useState } from 'react';
import { MapPin, Navigation, AlertCircle } from 'lucide-react';

const GPSTest = () => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const testGPS = async () => {
    setLoading(true);
    setError(null);
    setLocation(null);

    if (!navigator.geolocation) {
      setError('GPS not supported on this device');
      setLoading(false);
      return;
    }

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        );
      });

      const { latitude, longitude, accuracy } = position.coords;
      
      setLocation({
        lat: latitude,
        lng: longitude,
        accuracy: Math.round(accuracy),
        timestamp: new Date().toLocaleString()
      });

    } catch (err) {
      setError(`GPS Error: ${err.message}`);
    }
    
    setLoading(false);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-lg font-bold mb-4 flex items-center">
        <Navigation className="mr-2 text-blue-600" size={20} />
        GPS Location Test
      </h3>

      <button
        onClick={testGPS}
        disabled={loading}
        className="w-full mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Getting Location...' : 'Test GPS Location'}
      </button>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
          <AlertCircle className="text-red-500 mr-2 mt-0.5" size={16} />
          <span className="text-red-700 text-sm">{error}</span>
        </div>
      )}

      {location && (
        <div className="space-y-3">
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center mb-2">
              <MapPin className="text-green-600 mr-2" size={16} />
              <span className="font-medium text-green-800">Location Found!</span>
            </div>
            
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div>
                <span className="font-medium">Latitude:</span> {location.lat.toFixed(6)}
              </div>
              <div>
                <span className="font-medium">Longitude:</span> {location.lng.toFixed(6)}
              </div>
              <div>
                <span className="font-medium">Accuracy:</span> ±{location.accuracy}m
              </div>
              <div>
                <span className="font-medium">Time:</span> {location.timestamp}
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-green-200">
              <a
                href={`https://maps.google.com/?q=${location.lat},${location.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm underline"
              >
                View on Google Maps
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GPSTest;