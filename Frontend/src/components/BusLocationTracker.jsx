import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { MapPin, Clock, Navigation, AlertCircle } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import io from 'socket.io-client';

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
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#dc2626" width="32" height="32">
      <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

const BusLocationTracker = ({ busNumber }) => {
  const [busLocation, setBusLocation] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [lastUpdate, setLastUpdate] = useState(null);
  const [socket, setSocket] = useState(null);

  // Default center (Dewas)
  const defaultCenter = [22.9676, 76.0534];

  useEffect(() => {
    if (!busNumber) return;

    // Fetch initial location
    fetchBusLocation();

    // Setup Socket.io connection
    const newSocket = io('http://localhost:5001', {
      withCredentials: true,
      timeout: 5000
    });

    newSocket.on('connect', () => {
      console.log('Connected to tracking server');
      setConnectionStatus('connected');
      newSocket.emit('join-student', busNumber);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from tracking server');
      setConnectionStatus('disconnected');
    });

    newSocket.on('busLocationUpdate', (data) => {
      if (data.busNumber === busNumber) {
        console.log('Live location update:', data);
        setBusLocation({
          lat: data.location.lat,
          lng: data.location.lng,
          accuracy: data.accuracy,
          speed: data.speed,
          timestamp: data.timestamp,
          tripStatus: data.tripStatus
        });
        setLastUpdate(new Date());
      }
    });

    newSocket.on('tripEnded', (data) => {
      if (data.busNumber === busNumber) {
        console.log('Trip ended for bus:', busNumber);
        setConnectionStatus('trip_ended');
      }
    });

    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.close();
      }
    };
  }, [busNumber]);

  const fetchBusLocation = async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/driver/bus-location/${busNumber}`, {
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (data.success && data.location) {
        setBusLocation(data.location);
        setConnectionStatus('active');
        setLastUpdate(new Date());
      } else {
        setConnectionStatus('inactive');
        console.log('Bus location not available:', data.message);
      }
    } catch (error) {
      console.error('Failed to fetch bus location:', error);
      setConnectionStatus('error');
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
      case 'active':
        return 'text-green-600';
      case 'connecting':
        return 'text-yellow-600';
      case 'disconnected':
      case 'inactive':
        return 'text-red-600';
      case 'trip_ended':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Live Tracking Active';
      case 'active':
        return 'Bus Location Available';
      case 'connecting':
        return 'Connecting...';
      case 'disconnected':
        return 'Connection Lost';
      case 'inactive':
        return 'Bus Not Active';
      case 'trip_ended':
        return 'Trip Ended';
      case 'error':
        return 'Connection Error';
      default:
        return 'Unknown Status';
    }
  };

  return (
    <div className="space-y-4">
      {/* Status Header */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${
              connectionStatus === 'connected' || connectionStatus === 'active' 
                ? 'bg-green-500 animate-pulse' 
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

      {/* Map */}
      <div className="h-96 rounded-lg overflow-hidden border">
        {busLocation && busLocation.lat && busLocation.lng ? (
          <MapContainer
            center={[busLocation.lat, busLocation.lng]}
            zoom={16}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            
            <Marker 
              position={[busLocation.lat, busLocation.lng]} 
              icon={busIcon}
            >
              <Popup>
                <div className="text-center">
                  <strong>Bus {busNumber}</strong><br/>
                  <small>
                    Lat: {busLocation?.lat?.toFixed(6) || 'N/A'}<br/>
                    Lng: {busLocation?.lng?.toFixed(6) || 'N/A'}<br/>
                    {busLocation?.accuracy && `Accuracy: ±${busLocation.accuracy}m`}<br/>
                    {busLocation?.speed && `Speed: ${busLocation.speed}km/h`}<br/>
                    Status: {busLocation?.tripStatus || 'Active'}
                  </small>
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        ) : (
          <div className="h-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
            <div className="text-center">
              {connectionStatus === 'inactive' ? (
                <>
                  <AlertCircle size={48} className="mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Bus Not Active</h3>
                  <p className="text-gray-500">The bus hasn't started its trip yet.</p>
                </>
              ) : connectionStatus === 'trip_ended' ? (
                <>
                  <MapPin size={48} className="mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Trip Ended</h3>
                  <p className="text-gray-500">The bus has completed its journey.</p>
                </>
              ) : (
                <>
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Loading Location...</h3>
                  <p className="text-gray-500">Connecting to bus tracking system.</p>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Location Details */}
      {busLocation && (
        <div className="bg-white p-4 rounded-lg shadow border">
          <h4 className="font-medium text-gray-900 mb-3">Location Details</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Latitude:</span>
              <p className="font-medium">{busLocation?.lat?.toFixed(6) || 'N/A'}</p>
            </div>
            <div>
              <span className="text-gray-600">Longitude:</span>
              <p className="font-medium">{busLocation?.lng?.toFixed(6) || 'N/A'}</p>
            </div>
            {busLocation?.accuracy && (
              <div>
                <span className="text-gray-600">Accuracy:</span>
                <p className="font-medium">±{busLocation.accuracy}m</p>
              </div>
            )}
            {busLocation?.speed && (
              <div>
                <span className="text-gray-600">Speed:</span>
                <p className="font-medium">{busLocation.speed}km/h</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BusLocationTracker;