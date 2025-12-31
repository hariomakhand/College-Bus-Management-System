import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Play, Square, Users } from 'lucide-react';

const SimpleDriverMap = ({ route, busNumber, driverId, socket }) => {
  const [busLocation, setBusLocation] = useState(null);
  const [tripStatus, setTripStatus] = useState('idle');
  const watchId = useRef(null);

  const startTrip = async () => {
    if (!navigator.geolocation) {
      alert('GPS not supported, using mock location for Dewas');
      startMockTracking();
      return;
    }
    
    setTripStatus('active');
    
    // Try to get real GPS first, accept any accuracy
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log(`GPS found! Accuracy: ${position.coords.accuracy}m`);
        console.log(`Your actual location - Lat: ${position.coords.latitude}, Lng: ${position.coords.longitude}`);
        
        // Use real GPS regardless of accuracy
        startLocationTracking();
      },
      (error) => {
        console.log('GPS failed, using mock location for Dewas area');
        console.log('GPS Error:', error.message);
        startMockTracking();
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };
  
  const startMockTracking = () => {
    // Start with Dewas coordinates
    let mockLat = 22.9676;
    let mockLng = 76.0534;
    
    const updateMockLocation = () => {
      // Small random movement to simulate bus movement
      mockLat += (Math.random() - 0.5) * 0.001; // ~100m movement
      mockLng += (Math.random() - 0.5) * 0.001;
      
      const mockLocation = {
        lat: mockLat,
        lng: mockLng,
        accuracy: 50,
        speed: Math.random() * 20, // 0-20 m/s
        timestamp: new Date().toISOString(),
        isMock: true
      };
      
      setBusLocation(mockLocation);
      updateLocationToBackend(mockLocation);
      console.log('Mock location updated:', mockLocation);
    };
    
    // Initial location
    updateMockLocation();
    
    // Update every 3 seconds
    const mockInterval = setInterval(updateMockLocation, 3000);
    watchId.current = mockInterval;
  };
  
  const startLocationTracking = () => {
    watchId.current = navigator.geolocation.watchPosition(
      async (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          speed: position.coords.speed || 0,
          timestamp: new Date().toISOString()
        };
        
        console.log(`GPS Reading - Lat: ${location.lat}, Lng: ${location.lng}, Accuracy: ${position.coords.accuracy}m`);
        
        // Accept all GPS readings, regardless of accuracy
        setBusLocation(location);
        updateLocationToBackend(location);
        console.log('✓ GPS Location updated:', location);
      },
      (error) => {
        console.error('GPS tracking error:', error);
        console.log('GPS Error Code:', error.code, 'Message:', error.message);
        
        // If GPS fails completely, switch to mock
        if (error.code === error.PERMISSION_DENIED) {
          alert('Location permission denied. Please allow location access.');
          setTripStatus('idle');
        } else {
          console.log('GPS issue, but continuing to try...');
        }
      },
      { 
        enableHighAccuracy: true, 
        timeout: 30000,
        maximumAge: 10000
      }
    );
  };
  
  const updateLocationToBackend = async (location) => {
    try {
      const response = await fetch('http://localhost:5001/api/driver/update-location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          driverId,
          busNumber,
          location,
          tripStatus: 'active'
        })
      });
      
      if (!response.ok) {
        console.error('Failed to update location:', response.statusText);
      } else {
        console.log('Location updated successfully');
      }
    } catch (error) {
      console.error('Failed to update location:', error);
    }
  };

  const endTrip = async () => {
    if (watchId.current) {
      if (typeof watchId.current === 'number') {
        // Clear geolocation watch
        navigator.geolocation.clearWatch(watchId.current);
      } else {
        // Clear mock interval
        clearInterval(watchId.current);
      }
      watchId.current = null;
    }
    setTripStatus('ended');
    
    try {
      await fetch('http://localhost:5001/api/driver/end-trip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ driverId, busNumber, tripStatus: 'ended' })
      });
    } catch (error) {
      console.error('Failed to end trip:', error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Trip Controls */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-4">
          <div className={`w-3 h-3 rounded-full ${
            tripStatus === 'active' ? 'bg-green-500 animate-pulse' : 
            tripStatus === 'ended' ? 'bg-red-500' : 'bg-gray-400'
          }`}></div>
          <span className="font-medium text-gray-700">
            {tripStatus === 'active' ? 'Trip Active - GPS Tracking' : 
             tripStatus === 'ended' ? 'Trip Ended' : 'Trip Not Started'}
          </span>
          {busLocation && (
            <span className="text-sm text-gray-500">
              Updated: {new Date(busLocation.timestamp).toLocaleTimeString()}
            </span>
          )}
        </div>
        
        <div className="flex space-x-2">
          {tripStatus === 'idle' ? (
            <>
              <button
                onClick={startTrip}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <Play size={16} />
                <span>Start Trip</span>
              </button>
              <button
                onClick={() => {
                  const userLat = prompt('Enter your current Latitude (e.g., 22.9676):');
                  const userLng = prompt('Enter your current Longitude (e.g., 76.0534):');
                  
                  if (userLat && userLng) {
                    const lat = parseFloat(userLat);
                    const lng = parseFloat(userLng);
                    
                    if (!isNaN(lat) && !isNaN(lng)) {
                      const manualLocation = {
                        lat: lat,
                        lng: lng,
                        accuracy: 10,
                        speed: 0,
                        timestamp: new Date().toISOString(),
                        isManual: true
                      };
                      
                      setBusLocation(manualLocation);
                      console.log('Manual location set:', manualLocation);
                      alert(`Manual location set:\nLat: ${lat}\nLng: ${lng}\n\nGoogle Maps: https://maps.google.com/?q=${lat},${lng}`);
                    } else {
                      alert('Invalid coordinates. Please enter valid numbers.');
                    }
                  }
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Manual Location
              </button>
            </>
          ) : tripStatus === 'active' ? (
            <button
              onClick={endTrip}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
            >
              <Square size={16} />
              <span>End Trip</span>
            </button>
          ) : (
            <button
              onClick={() => setTripStatus('idle')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              New Trip
            </button>
          )}
        </div>
      </div>

      {/* Map Placeholder */}
      <div className="h-96 rounded-lg overflow-hidden border bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <MapPin size={64} className="mx-auto mb-4 text-blue-500" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">GPS Tracking Active</h3>
          <p className="text-gray-600 mb-4">Route: {route?.routeName}</p>
          {busLocation ? (
            <div className="bg-white p-4 rounded-lg shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-700">Current Location:</p>
                {busLocation.isMock && (
                  <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                    Mock Location (Dewas)
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-600">
                Lat: {busLocation.lat.toFixed(6)}, Lng: {busLocation.lng.toFixed(6)}
              </p>
              <div className="flex items-center space-x-4 mt-2">
                {busLocation.accuracy && (
                  <p className={`text-xs ${
                    busLocation.accuracy <= 20 ? 'text-green-600' :
                    busLocation.accuracy <= 50 ? 'text-blue-600' :
                    busLocation.accuracy <= 100 ? 'text-orange-600' : 'text-red-600'
                  }`}>
                    Accuracy: ±{Math.round(busLocation.accuracy)}m
                  </p>
                )}
                {busLocation.speed !== undefined && (
                  <p className="text-xs text-purple-600">
                    Speed: {Math.round((busLocation.speed || 0) * 3.6)}km/h
                  </p>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Last Update: {new Date(busLocation.timestamp).toLocaleTimeString()}
              </p>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-gray-500 mb-2">Start trip to begin tracking</p>
              <p className="text-xs text-gray-400">
                Will use GPS if available, otherwise Dewas mock location
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Trip Status */}
      {tripStatus === 'active' && busLocation && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Navigation className="text-green-600" size={20} />
              <span className="font-medium text-gray-700">GPS Coordinates</span>
            </div>
            <p className="text-sm text-gray-600">
              {busLocation.lat.toFixed(6)}, {busLocation.lng.toFixed(6)}
              {busLocation.accuracy && (
                <span className="ml-2 text-blue-600">
                  (±{Math.round(busLocation.accuracy)}m)
                </span>
              )}
            </p>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="text-blue-600" size={20} />
              <span className="font-medium text-gray-700">Live Sharing</span>
            </div>
            <p className="text-sm text-gray-600">Location shared with students</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleDriverMap;