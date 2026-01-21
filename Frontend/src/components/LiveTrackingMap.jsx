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
  
  // Default center (Sundrel, MP)
  const defaultCenter = [22.8734, 75.8687];

  useEffect(() => {
    return () => {
      if (watchId.current) {
        if (typeof watchId.current === 'number') {
          navigator.geolocation.clearWatch(watchId.current);
        } else {
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
    if (!navigator.geolocation) {
      alert('GPS not supported, using mock location');
      startMockTracking();
      return;
    }
    
    setTripStatus('active');
    setIsTracking(true);
    
    // Get current location first
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const initialLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          speed: position.coords.speed || 0,
          heading: position.coords.heading || 0,
          timestamp: new Date().toISOString(),
          isGPS: true
        };
        
        console.log('Initial GPS location:', initialLocation);
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
            
            console.log(`GPS Update: ${latitude}, ${longitude} (±${Math.round(accuracy)}m)`);
            setBusLocation(newLocation);
            updateLocationToBackend(newLocation);
          },
          (error) => {
            if (error.code === 3) {
              return;
            }
            console.error('GPS tracking error:', error);
            startMockTracking();
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 5000
          }
        );
      },
      (error) => {
        console.error('Initial GPS error:', error);
        console.log('Using mock location instead');
        startMockTracking();
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
  
  const startMockTracking = () => {
    setTripStatus('active');
    setIsTracking(true);
    
    // Sundrel coordinates
    let mockLat = 22.8734;
    let mockLng = 75.8687;
    
    const updateMockLocation = () => {
      // Simulate realistic bus movement in Sundrel area
      mockLat += (Math.random() - 0.5) * 0.0005; // ~50m movement
      mockLng += (Math.random() - 0.5) * 0.0005;
      
      const mockLocation = {
        lat: mockLat,
        lng: mockLng,
        accuracy: 10,
        speed: Math.random() * 15, // 0-15 m/s
        heading: Math.random() * 360,
        timestamp: new Date().toISOString(),
        isMock: true,
        location: 'Sundrel, MP'
      };
      
      setBusLocation(mockLocation);
      updateLocationToBackend(mockLocation);
      console.log('Mock location updated (Sundrel):', mockLocation);
    };
    
    // Initial location
    updateMockLocation();
    
    // Update every 2 seconds for smooth movement
    const mockInterval = setInterval(updateMockLocation, 2000);
    watchId.current = mockInterval;
  };
  
  const stopTracking = () => {
    console.log('Stopping tracking...');
    
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
    setBusLocation(null);
    
    // Notify backend to stop tracking
    fetch('http://localhost:5001/api/driver/end-trip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ driverId, busNumber, tripStatus: 'ended' })
    }).then(() => {
      console.log('Trip ended successfully');
    }).catch(console.error);
  };
  
  const updateLocationToBackend = async (location) => {
    console.log('=== UPDATE LOCATION TO BACKEND ===');
    console.log('Bus Number:', busNumber);
    console.log('Driver ID:', driverId);
    console.log('Location:', location);
    
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
            <button
              onClick={startLiveTracking}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <Play size={16} />
              <span>Start Tracking</span>
            </button>
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
          
          {/* Test DB Button */}
          <button
            onClick={async () => {
              try {
                const response = await fetch(`http://localhost:5001/api/driver/bus-location/${busNumber}`, {
                  credentials: 'include'
                });
                const data = await response.json();
                console.log('DB Location Check:', data);
                alert('Check console for DB location data');
              } catch (error) {
                console.error('DB check error:', error);
                alert('Error checking DB: ' + error.message);
              }
            }}
            className="mt-4 w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Test: Check Location in DB
          </button>
        </div>
      )}
    </div>
  );
};

export default LiveTrackingMap;