import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { MapPin, Navigation, Play, Square, Users } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom bus icon
const busIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#2563eb" width="32" height="32">
      <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

// Map updater component
const MapUpdater = ({ position }) => {
  const map = useMap();
  
  useEffect(() => {
    if (position) {
      map.flyTo([position.lat, position.lng], 16, {
        animate: true,
        duration: 1
      });
    }
  }, [position, map]);
  
  return null;
};

const LiveTrackingMap = ({ route, busNumber, driverId, socket }) => {
  const [busLocation, setBusLocation] = useState(null);
  const [tripStatus, setTripStatus] = useState('idle');
  const [isTracking, setIsTracking] = useState(false);
  const watchId = useRef(null);
  
  // Default center (Dewas)
  const defaultCenter = [22.9676, 76.0534];

  const startActualLocationTracking = (initialLocation) => {
    // Set initial location
    setBusLocation(initialLocation);
    updateLocationToBackend(initialLocation);  
    
    // Start continuous tracking from actual location
    watchId.current = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          speed: position.coords.speed || 0,
          heading: position.coords.heading || 0,
          timestamp: new Date().toISOString(),
          isActual: true
        };
        
        console.log('Actual GPS Update:', newLocation);
        setBusLocation(newLocation);
        updateLocationToBackend(newLocation);
      },
      (error) => {
        console.error('Actual GPS Error:', error);
        alert('GPS tracking failed. Switching to mock mode.');
        startMockTracking();
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 2000
      }
    );
  };
  
  const startLiveTracking = () => {
    if (!navigator.geolocation) {
      alert('GPS not supported, using mock location');
      startMockTracking();
      return;
    }
    
    setTripStatus('active');
    setIsTracking(true);
    
    // Try multiple GPS methods automatically
    const tryGPSMethods = async () => {
      console.log('Trying to get your location automatically...');
      
      // Method 1: High accuracy GPS
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          });
        });
        
        console.log('High accuracy GPS success:', position.coords);
        startGPSTracking(position);
        return;
      } catch (error) {
        console.log('High accuracy GPS failed:', error.message);
      }
      
      // Method 2: Normal GPS
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: false,
            timeout: 8000,
            maximumAge: 30000
          });
        });
        
        console.log('Normal GPS success:', position.coords);
        startGPSTracking(position);
        return;
      } catch (error) {
        console.log('Normal GPS failed:', error.message);
      }
      
      // Method 3: Fallback to mock location
      console.log('All GPS methods failed, using mock location');
      startMockTracking();
    };
    
    tryGPSMethods();
  };
  
  const startGPSTracking = (initialPosition) => {
    const initialLocation = {
      lat: initialPosition.coords.latitude,
      lng: initialPosition.coords.longitude,
      accuracy: initialPosition.coords.accuracy,
      speed: initialPosition.coords.speed || 0,
      heading: initialPosition.coords.heading || 0,
      timestamp: new Date().toISOString(),
      isGPS: true
    };
    
    setBusLocation(initialLocation);
    updateLocationToBackend(initialLocation);
    console.log('Starting GPS tracking from:', initialLocation);
    
    // Start continuous tracking with accuracy filter
    watchId.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy, speed, heading } = position.coords;
        
        // Accuracy filter - ignore readings worse than 500m
        if (accuracy > 500) {
          console.log(`Location accuracy too poor: ±${Math.round(accuracy)}m, waiting for better signal...`);
          return;
        }
        
        const newLocation = {
          lat: latitude,
          lng: longitude,
          accuracy: accuracy,
          speed: speed || 0,
          heading: heading || 0,
          timestamp: new Date().toISOString(),
          isGPS: true
        };
        
        console.log(`GPS Update: ±${Math.round(accuracy)}m accuracy, Speed: ${Math.round((speed || 0) * 3.6)}km/h`);
        setBusLocation(newLocation);
        updateLocationToBackend(newLocation);
      },
      (error) => {
        console.error('GPS tracking error:', error);
        // Continue tracking even on errors
      },
      {
        enableHighAccuracy: true,  // Force GPS chip activation
        timeout: 15000,           // 15 second timeout
        maximumAge: 5000          // Allow 5 second old data
      }
    );
  };
  
  const startMockTracking = () => {
    setTripStatus('active');
    setIsTracking(true);
    
    let mockLat = 22.9676;
    let mockLng = 76.0534;
    
    const updateMockLocation = () => {
      // Simulate realistic bus movement
      mockLat += (Math.random() - 0.5) * 0.0005; // ~50m movement
      mockLng += (Math.random() - 0.5) * 0.0005;
      
      const mockLocation = {
        lat: mockLat,
        lng: mockLng,
        accuracy: 10,
        speed: Math.random() * 15, // 0-15 m/s
        heading: Math.random() * 360,
        timestamp: new Date().toISOString(),
        isMock: true
      };
      
      setBusLocation(mockLocation);
      updateLocationToBackend(mockLocation);
      console.log('Mock location updated:', mockLocation);
    };
    
    // Initial location
    updateMockLocation();
    
    // Update every 2 seconds for smooth movement
    const mockInterval = setInterval(updateMockLocation, 2000);
    watchId.current = mockInterval;
  };
  
  const stopTracking = () => {
    if (watchId.current) {
      if (typeof watchId.current === 'number') {
        navigator.geolocation.clearWatch(watchId.current);
      } else {
        clearInterval(watchId.current);
      }
      watchId.current = null;
    }
    
    setTripStatus('ended');
    setIsTracking(false);
    
    // Notify backend
    fetch('http://localhost:5001/api/driver/end-trip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ driverId, busNumber, tripStatus: 'ended' })
    }).catch(console.error);
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
      
      if (response.ok) {
        console.log(`Location sent: ±${Math.round(location.accuracy || 0)}m accuracy`);
      }
    } catch (error) {
      console.error('Failed to update location:', error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-4">
          <div className={`w-3 h-3 rounded-full ${
            isTracking ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
          }`}></div>
          <span className="font-medium text-gray-700">
            {isTracking ? 'Live Tracking Active' : 'Tracking Stopped'}
          </span>
          {busLocation && (
            <span className="text-sm text-gray-500">
              {busLocation.isMock ? 'Mock Location' : 
               busLocation.isGPS ? 'Live GPS' : 
               busLocation.isManual ? 'Manual' : 'GPS'} • {new Date(busLocation.timestamp).toLocaleTimeString()}
            </span>
          )}
        </div>
        
        <div className="flex space-x-2">
          {!isTracking ? (
            <>
              <button
                onClick={startLiveTracking}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <Play size={16} />
                <span>Start Auto Tracking</span>
              </button>
              <button
                onClick={() => {
                  if (!navigator.geolocation) {
                    alert('GPS not supported on this device');
                    return;
                  }
                  
                  const tryMultipleGPS = async () => {
                    alert('Trying multiple GPS methods... Please wait');
                    
                    const methods = [
                      // Method 1: High accuracy, no cache
                      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
                      // Method 2: High accuracy, longer timeout
                      { enableHighAccuracy: true, timeout: 30000, maximumAge: 0 },
                      // Method 3: Normal accuracy
                      { enableHighAccuracy: false, timeout: 10000, maximumAge: 0 }
                    ];
                    
                    for (let i = 0; i < methods.length; i++) {
                      try {
                        console.log(`GPS Method ${i + 1} trying...`);
                        
                        const position = await new Promise((resolve, reject) => {
                          navigator.geolocation.getCurrentPosition(resolve, reject, methods[i]);
                        });
                        
                        const { latitude, longitude, accuracy } = position.coords;
                        
                        // Check if this looks like a real GPS reading
                        const isLikelyGPS = accuracy <= 100; // Good accuracy suggests real GPS
                        
                        const liveLocation = {
                          lat: latitude,
                          lng: longitude,
                          accuracy: accuracy,
                          speed: 0,
                          heading: 0,
                          timestamp: new Date().toISOString(),
                          isLive: true,
                          method: `GPS Method ${i + 1}`,
                          isLikelyGPS: isLikelyGPS
                        };
                        
                        setBusLocation(liveLocation);
                        
                        const locationInfo = `Location Found (Method ${i + 1}):\n\n` +
                          `Latitude: ${latitude}\n` +
                          `Longitude: ${longitude}\n` +
                          `Accuracy: ±${Math.round(accuracy)}m\n` +
                          `Quality: ${isLikelyGPS ? 'Good GPS' : 'Network-based'}\n\n` +
                          `Location shown on map!\n\n` +
                          `Google Maps: https://maps.google.com/?q=${latitude},${longitude}`;
                        
                        alert(locationInfo);
                        console.log('GPS Result:', liveLocation);
                        return; // Success, exit loop
                        
                      } catch (error) {
                        console.log(`GPS Method ${i + 1} failed:`, error.message);
                        if (i === methods.length - 1) {
                          // All methods failed
                          alert('All GPS methods failed. This might be because:\n\n' +
                            '1. You\'re indoors (GPS needs open sky)\n' +
                            '2. Location services are disabled\n' +
                            '3. Browser is using network location\n\n' +
                            'Try going outside and enabling high accuracy GPS.');
                        }
                      }
                    }
                  };
                  
                  tryMultipleGPS();
                }}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Advanced GPS Test
              </button>
            </>
          ) : (
            <button
              onClick={stopTracking}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
            >
              <Square size={16} />
              <span>Stop Tracking</span>
            </button>
          )}
        </div>
      </div>

      {/* Live Map */}
      <div className="h-96 rounded-lg overflow-hidden border">
        <MapContainer
          center={busLocation ? [busLocation.lat, busLocation.lng] : defaultCenter}
          zoom={16}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          
          {/* Map updater for smooth following */}
          <MapUpdater position={busLocation} />
          
          {/* Bus marker */}
          {busLocation && (
            <Marker 
              position={[busLocation.lat, busLocation.lng]} 
              icon={busIcon}
            >
              <Popup>
                <div className="text-center">
                  <strong>Bus {busNumber}</strong><br/>
                  <small>
                    Lat: {busLocation.lat.toFixed(6)}<br/>
                    Lng: {busLocation.lng.toFixed(6)}<br/>
                    Accuracy: ±{Math.round(busLocation.accuracy)}m<br/>
                    Speed: {Math.round((busLocation.speed || 0) * 3.6)} km/h
                    {busLocation.isMock && (
                      <>
                        <br/>
                        <em>Mock Location</em>
                      </>
                    )}
                  </small>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      {/* Location Info */}
      {busLocation && (
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-600">Latitude:</span>
              <p className="text-gray-900">{busLocation.lat.toFixed(6)}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Longitude:</span>
              <p className="text-gray-900">{busLocation.lng.toFixed(6)}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Accuracy:</span>
              <p className={`${busLocation.accuracy <= 20 ? 'text-green-600' : 
                busLocation.accuracy <= 50 ? 'text-blue-600' : 'text-orange-600'}`}>
                ±{Math.round(busLocation.accuracy)}m
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Speed:</span>
              <p className="text-gray-900">{Math.round((busLocation.speed || 0) * 3.6)} km/h</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveTrackingMap;