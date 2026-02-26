import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Clock, AlertCircle, Bell } from 'lucide-react';
import io from 'socket.io-client';
import { getBusDistanceToStop, formatETAMessage } from '../utils/busTracking';
import { parseStops } from '../utils/parseStops';

const StudentLocationMap = ({ busNumber, studentStop, route }) => {
  const [busLocation, setBusLocation] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [lastUpdate, setLastUpdate] = useState(null);
  const [map, setMap] = useState(null);
  const [busMarker, setBusMarker] = useState(null);
  const [stopMarker, setStopMarker] = useState(null);
  const [distanceInfo, setDistanceInfo] = useState(null);
  const [hasNotified5km, setHasNotified5km] = useState(false);
  const [hasNotified2km, setHasNotified2km] = useState(false);
  const mapRef = useRef(null);
  const socketRef = useRef(null);

  // Calculate distance and ETA when bus location updates
  useEffect(() => {
    if (busLocation && studentStop) {
      const info = getBusDistanceToStop(busLocation, studentStop);
      setDistanceInfo(info);
      
      // Notification logic
      if (info && info.shouldNotify) {
        const dist = parseFloat(info.distance);
        
        // 5km notification
        if (dist <= 5 && dist > 4.5 && !hasNotified5km) {
          showNotification('🚌 Bus Approaching!', `Your bus is 5 km away. ETA: ${formatETAMessage(info.eta)}`);
          setHasNotified5km(true);
        }
        
        // 2km notification
        if (dist <= 2 && dist > 1.5 && !hasNotified2km) {
          showNotification('🚌 Bus Very Close!', `Your bus is 2 km away. ETA: ${formatETAMessage(info.eta)}`);
          setHasNotified2km(true);
        }
      }
    }
  }, [busLocation, studentStop]);

  // Show browser notification
  const showNotification = (title, body) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/bus-icon.png' });
    }
  };

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || map) return;

    const initMap = async () => {
      try {
        const L = await import('leaflet');
        await import('leaflet/dist/leaflet.css');

        // Fix default markers
        delete L.default.Icon.Default.prototype._getIconUrl;
        L.default.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });

        const mapInstance = L.default.map(mapRef.current).setView([28.6139, 77.2090], 13);
        
        L.default.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(mapInstance);

        setMap(mapInstance);
        
        // Add student stop marker if available
        if (studentStop && studentStop.coordinates) {
          addStopMarker(mapInstance, studentStop);
        }
      } catch (error) {
        console.error('Map initialization error:', error);
        setConnectionStatus('error');
      }
    };

    initMap();

    return () => {
      if (map) {
        try {
          map.remove();
        } catch (e) {
          console.log('Map cleanup error (ignored):', e.message);
        }
      }
    };
  }, []);

  // Add student stop marker
  const addStopMarker = async (mapInstance, stop) => {
    if (!mapInstance || !stop.coordinates) return;
    
    try {
      const L = await import('leaflet');
      
      const stopIcon = L.default.divIcon({
        html: `<div style="background: #EF4444; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">📍</div>`,
        className: 'custom-stop-marker',
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });

      const marker = L.default.marker(
        [stop.coordinates.lat, stop.coordinates.lng], 
        { icon: stopIcon }
      )
        .addTo(mapInstance)
        .bindPopup(`
          <div style="text-align: center;">
            <strong>Your Stop</strong><br/>
            <small>${stop.name}</small>
          </div>
        `);

      setStopMarker(marker);
    } catch (error) {
      console.error('Stop marker error:', error);
    }
  };

  // Socket connection and location tracking
  useEffect(() => {
    if (!busNumber) {
      setConnectionStatus('inactive');
      return;
    }

    console.log('Connecting to track bus:', busNumber);
    fetchBusLocation();

    const socket = io('http://localhost:5001', {
      withCredentials: true,
      timeout: 5000
    });

    socket.on('connect', () => {
      setConnectionStatus('connected');
      socket.emit('join-bus-tracking', busNumber);
    });

    socket.on('disconnect', () => {
      setConnectionStatus('disconnected');
    });

    socket.on('busLocationUpdate', (data) => {
      if (data.busNumber === busNumber) {
        const location = {
          lat: data.location.lat,
          lng: data.location.lng,
          accuracy: data.accuracy,
          speed: data.speed,
          timestamp: data.timestamp
        };
        setBusLocation(location);
        setLastUpdate(new Date());
        setConnectionStatus('active');
        updateMapLocation(location);
      }
    });

    socket.on('tripEnded', (data) => {
      if (data.busNumber === busNumber) {
        setConnectionStatus('trip_ended');
      }
    });

    socketRef.current = socket;

    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [busNumber, map]);

  const fetchBusLocation = async () => {
    if (!busNumber) return;
    
    try {
      const response = await fetch(`http://localhost:5001/api/driver/bus-location/${busNumber}`, {
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (data.success && data.location) {
        setBusLocation(data.location);
        setConnectionStatus('active');
        setLastUpdate(new Date());
        updateMapLocation(data.location);
      } else if (data.lastKnownLocation) {
        setBusLocation(data.lastKnownLocation);
        setConnectionStatus('outdated');
        setLastUpdate(new Date(data.lastKnownLocation.timestamp));
        updateMapLocation(data.lastKnownLocation);
      } else {
        setConnectionStatus('inactive');
      }
    } catch (error) {
      console.error('Location fetch error:', error);
      setConnectionStatus('error');
    }
  };

  const updateMapLocation = async (location) => {
    if (!map || !location?.lat || !location?.lng) return;

    try {
      const L = await import('leaflet');
      
      // Remove existing marker
      if (busMarker) {
        map.removeLayer(busMarker);
      }

      // Create bus icon
      const busIcon = L.default.divIcon({
        html: `<div style="background: #3B82F6; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">🚌</div>`,
        className: 'custom-bus-marker',
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });

      // Add new marker
      const marker = L.default.marker([location.lat, location.lng], { icon: busIcon })
        .addTo(map)
        .bindPopup(`
          <div style="text-align: center;">
            <strong>Bus ${busNumber}</strong><br/>
            <small>Last updated: ${new Date(location.timestamp || Date.now()).toLocaleTimeString()}</small>
            ${location.speed ? `<br/><small>Speed: ${location.speed} km/h</small>` : ''}
          </div>
        `);

      setBusMarker(marker);
      map.setView([location.lat, location.lng], 15);
    } catch (error) {
      console.error('Marker update error:', error);
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
      case 'active':
        return 'text-green-600';
      case 'outdated':
        return 'text-orange-600';
      case 'connecting':
        return 'text-yellow-600';
      default:
        return 'text-red-600';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Live Tracking Active';
      case 'active':
        return 'Bus Location Available';
      case 'outdated':
        return 'Last Known Location';
      case 'connecting':
        return 'Connecting...';
      case 'disconnected':
        return 'Connection Lost';
      case 'inactive':
        return 'Bus Not Active';
      default:
        return 'Connection Error';
    }
  };

  return (
    <div className="space-y-4">
      {/* Distance & ETA Card */}
      {distanceInfo && (
        <div className={`p-4 rounded-lg shadow border ${
          distanceInfo.isVeryNear ? 'bg-red-50 border-red-200' :
          distanceInfo.isNear ? 'bg-yellow-50 border-yellow-200' :
          'bg-blue-50 border-blue-200'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 flex items-center">
              <Bell className={`mr-2 ${
                distanceInfo.isVeryNear ? 'text-red-600 animate-bounce' :
                distanceInfo.isNear ? 'text-yellow-600' :
                'text-blue-600'
              }`} size={20} />
              Bus Distance
            </h3>
            {distanceInfo.isVeryNear && (
              <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
                ARRIVING SOON!
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-white rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Distance</p>
              <p className="text-2xl font-bold text-gray-900">{distanceInfo.distance} km</p>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Estimated Time</p>
              <p className="text-2xl font-bold text-gray-900">{formatETAMessage(distanceInfo.eta)}</p>
            </div>
          </div>
          
          {distanceInfo.isNear && (
            <div className="mt-3 p-3 bg-white rounded-lg border-l-4 border-yellow-500">
              <p className="text-sm font-medium text-gray-900">
                🚌 Your bus is nearby! Please be ready at your stop.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Status Header */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${
              connectionStatus === 'connected' || connectionStatus === 'active' 
                ? 'bg-green-500 animate-pulse' 
                : connectionStatus === 'outdated'
                ? 'bg-orange-500'
                : 'bg-red-500'
            }`}></div>
            <span className={`font-medium ${getStatusColor()}`}>
              {getStatusText()}
            </span>
          </div>
          
          {lastUpdate && (
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Clock size={16} />
              <span>Updated: {lastUpdate.toLocaleTimeString()}</span>
            </div>
          )}
        </div>
        
        {busNumber && (
          <p className="text-sm text-gray-600 mt-2">
            Tracking Bus: <span className="font-medium">{busNumber}</span>
          </p>
        )}
      </div>

      {/* Map Container */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div 
          ref={mapRef} 
          style={{ height: '400px', width: '100%' }}
          className="relative"
        >
          {connectionStatus === 'error' && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
              <div className="text-center">
                <AlertCircle size={48} className="mx-auto mb-4 text-red-400" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">Map Error</h3>
                <p className="text-gray-500 mb-4">Failed to load map</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Reload Page
                </button>
              </div>
            </div>
          )}
          
          {connectionStatus === 'inactive' && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
              <div className="text-center">
                <MapPin size={48} className="mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">Bus Not Active</h3>
                <p className="text-gray-500 mb-4">Waiting for driver to start tracking</p>
                <button
                  onClick={fetchBusLocation}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Check Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Location Details */}
      {busLocation && busLocation.lat && busLocation.lng && (
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
            <Navigation className="mr-2 text-blue-600" size={16} />
            Location Details
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="text-center p-2 bg-blue-50 rounded">
              <p className="text-xs text-gray-600">Latitude</p>
              <p className="font-medium text-gray-900">{busLocation.lat.toFixed(6)}</p>
            </div>
            <div className="text-center p-2 bg-blue-50 rounded">
              <p className="text-xs text-gray-600">Longitude</p>
              <p className="font-medium text-gray-900">{busLocation.lng.toFixed(6)}</p>
            </div>
            {busLocation.accuracy && (
              <div className="text-center p-2 bg-green-50 rounded">
                <p className="text-xs text-gray-600">Accuracy</p>
                <p className="font-medium text-gray-900">±{busLocation.accuracy}m</p>
              </div>
            )}
            {busLocation.speed && (
              <div className="text-center p-2 bg-orange-50 rounded">
                <p className="text-xs text-gray-600">Speed</p>
                <p className="font-medium text-gray-900">{busLocation.speed}km/h</p>
              </div>
            )}
          </div>

          <div className="flex space-x-3 mt-4">
            <a
              href={`https://maps.google.com/?q=${busLocation.lat},${busLocation.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-3 py-2 bg-blue-600 text-white rounded text-center text-sm hover:bg-blue-700"
            >
              Open in Google Maps
            </a>
            <button
              onClick={fetchBusLocation}
              className="px-3 py-2 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
            >
              Refresh
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentLocationMap;