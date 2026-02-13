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
  const [gpsPermission, setGpsPermission] = useState('unknown'); // 'granted', 'denied', 'prompt', 'unknown'
  const watchId = useRef(null);
  const isTrackingRef = useRef(false); // Use ref to avoid closure issues
  
  // Default center (Sundrel, MP)
  const defaultCenter = [22.8734, 75.8687];

  // Sync ref with state
  useEffect(() => {
    isTrackingRef.current = isTracking;
  }, [isTracking]);

  // Check GPS permission on component mount
  useEffect(() => {
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' })
        .then(result => {
          setGpsPermission(result.state);
          console.log('GPS Permission:', result.state);
          
          // Listen for permission changes
          result.addEventListener('change', () => {
            setGpsPermission(result.state);
            console.log('GPS Permission changed to:', result.state);
          });
        })
        .catch(() => setGpsPermission('unknown'));
    }
  }, []);

  useEffect(() => {
    return () => {
      console.log('🧹 Component unmounting - cleaning up tracking...');
      if (watchId.current) {
        if (typeof watchId.current === 'number') {
          console.log('📍 Cleanup: Clearing GPS watch');
          navigator.geolocation.clearWatch(watchId.current);
        } else {
          console.log('⏰ Cleanup: Clearing mock interval');
          clearInterval(watchId.current);
        }
        watchId.current = null;
      }
    };
  }, []);

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
    console.log('🚀 Starting live tracking...');
    
    if (!navigator.geolocation) {
      alert('GPS not supported on this device.');
      return;
    }
    
    setTripStatus('active');
    setIsTracking(true);
    
    console.log('📍 Requesting GPS permission...');
    
    // Get current location first with better error handling
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('✅ GPS permission granted!');
        const initialLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          speed: position.coords.speed || 0,
          heading: position.coords.heading || 0,
          timestamp: new Date().toISOString(),
          isGPS: true
        };
        
        console.log('📍 Initial GPS location:', initialLocation);
        setBusLocation(initialLocation);
        updateLocationToBackend(initialLocation);
        
        // Start continuous tracking
        watchId.current = navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude, accuracy, speed, heading } = position.coords;
            
            const newLocation = {
              lat: latitude,
              lng: longitude,
              accuracy: accuracy,
              speed: speed || 0,
              heading: heading || 0,
              timestamp: new Date().toISOString(),
              isGPS: true
            };
            
            console.log(`🔄 GPS Update: ${latitude}, ${longitude} (±${Math.round(accuracy)}m)`);
            setBusLocation(newLocation);
            updateLocationToBackend(newLocation);
          },
          (error) => {
            console.error('❌ GPS tracking error:', error);
            if (error.code !== 3) { // Not timeout
              alert('GPS tracking failed. Please check your location settings.');
              stopTracking();
            }
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 5000
          }
        );
      },
      (error) => {
        console.error('❌ Initial GPS error:', error);
        
        // Reset tracking state immediately
        setTripStatus('idle');
        setIsTracking(false);
        
        let errorMessage = 'GPS access failed. ';
        
        switch(error.code) {
          case 1:
            errorMessage = 'Location access denied. Please allow location permission in your browser settings and try again.';
            break;
          case 2:
            errorMessage = 'Location unavailable. Please check your GPS settings and try again.';
            break;
          case 3:
            errorMessage = 'Location request timeout. Please try again.';
            break;
          default:
            errorMessage = 'Unknown GPS error occurred. Please try again.';
        }
        
        alert(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
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
  

  const stopTracking = () => {
    // Prevent duplicate stop calls
    if (!isTracking) {
      console.log('⚠️ Tracking already stopped');
      return;
    }
    
    console.log('🛑 Stopping tracking...');
    
    // Clear watch/interval immediately
    if (watchId.current) {
      if (typeof watchId.current === 'number') {
        console.log('📍 Clearing GPS watch:', watchId.current);
        navigator.geolocation.clearWatch(watchId.current);
      } else {
        console.log('⏰ Clearing mock interval:', watchId.current);
        clearInterval(watchId.current);
      }
      watchId.current = null;
    }
    
    // Update states immediately
    setTripStatus('ended');
    setIsTracking(false);
    setBusLocation(null);
    
    console.log('✅ Tracking stopped, states cleared');
    
    // Notify backend to stop tracking
    fetch(`${import.meta.env.VITE_API_URL}/api/driver/end-trip`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ driverId, busNumber, tripStatus: 'ended' })
    }).then(response => {
      if (response.ok) {
        console.log('✅ Backend notified - trip ended');
      } else {
        console.error('❌ Failed to notify backend');
      }
    }).catch(error => {
      console.error('❌ Backend notification error:', error);
    });
  };
  
  const updateLocationToBackend = async (location) => {
    // Check if tracking is still active before sending
    if (!isTrackingRef.current) {
      console.log('⚠️ Tracking stopped - ignoring location update');
      return;
    }
    
    console.log('=== UPDATE LOCATION TO BACKEND ===');
    console.log('Bus Number:', busNumber);
    console.log('Driver ID:', driverId);
    console.log('Location:', location);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/driver/update-location`, {
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
      
      const result = await response.json();
      console.log('Backend Response:', result);
      
      if (response.ok) {
        console.log('✓ Location saved to DB successfully');
        
        // Emit to socket for real-time updates
        if (socket && socket.connected) {
          console.log('✓ Emitting to socket room bus-' + busNumber);
          socket.emit('location-update', {
            busNumber,
            location,
            driverId,
            timestamp: location.timestamp
          });
        } else {
          console.log('⚠️ Socket not connected');
        }
      } else {
        console.error('✗ Failed to save location:', result);
      }
    } catch (error) {
      console.error('✗ Location update error:', error);
    }
  };

  return (
    <div className="space-y-4">
      {/* GPS Instructions */}
      {!isTracking && gpsPermission === 'denied' && (
        <div className="p-4 rounded-lg border-l-4 bg-red-50 border-red-400 text-red-700">
          <div className="flex items-start space-x-2">
            <MapPin className="mt-0.5 flex-shrink-0" size={16} />
            <div className="text-sm">
              <strong>GPS Access Required:</strong> Location permission is needed for tracking.
              <ol className="mt-2 ml-4 list-decimal space-y-1">
                <li>Click the location icon in your browser's address bar</li>
                <li>Select "Allow" for location access</li>
                <li>Refresh the page and try again</li>
              </ol>
            </div>
          </div>
        </div>
      )}
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
              📡 Live GPS • {new Date(busLocation.timestamp).toLocaleTimeString()}
            </span>
          )}
          {/* GPS Permission Status */}
          {gpsPermission === 'denied' && (
            <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700">
              GPS: ✗ Blocked
            </span>
          )}
        </div>
        
        <div className="flex space-x-2">
          {!isTracking ? (
            <button
              onClick={startLiveTracking}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 font-medium"
            >
              <Play size={16} />
              <span>Start Tracking</span>
            </button>
          ) : (
            <button
              onClick={stopTracking}
              title="Stop location tracking"
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2 font-medium"
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