import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Navigation, AlertCircle } from 'lucide-react';
import io from 'socket.io-client';

const SimpleBusTracker = ({ busNumber }) => {
  const [busLocation, setBusLocation] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [lastUpdate, setLastUpdate] = useState(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!busNumber) {
      setConnectionStatus('inactive');
      return;
    }

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
      newSocket.emit('join-bus-tracking', busNumber);
    });

    newSocket.on('disconnect', () => {
      setConnectionStatus('disconnected');
    });

    newSocket.on('busLocationUpdate', (data) => {
      console.log('Received location update:', data);
      if (data.busNumber === busNumber) {
        setBusLocation({
          lat: data.location.lat,
          lng: data.location.lng,
          accuracy: data.accuracy,
          speed: data.speed,
          timestamp: data.timestamp,
          tripStatus: data.tripStatus
        });
        setLastUpdate(new Date());
        setConnectionStatus('active');
      }
    });

    newSocket.on('tripEnded', (data) => {
      if (data.busNumber === busNumber) {
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
    if (!busNumber) {
      console.log('No bus number provided');
      return;
    }
    
    console.log('Fetching location for bus:', busNumber);
    
    try {
      const response = await fetch(`http://localhost:5001/api/driver/bus-location/${busNumber}`, {
        credentials: 'include'
      });
      
      const data = await response.json();
      console.log('Location API response:', data);
      
      if (data.success && data.location) {
        console.log('Setting bus location:', data.location);
        setBusLocation(data.location);
        setConnectionStatus('active');
        setLastUpdate(new Date());
      } else if (data.lastKnownLocation) {
        console.log('Setting last known location (outdated):', data.lastKnownLocation);
        setBusLocation(data.lastKnownLocation);
        setConnectionStatus('outdated');
        setLastUpdate(new Date(data.lastKnownLocation.timestamp));
      } else {
        console.log('Bus not active or no location:', data.message);
        setConnectionStatus('inactive');
      }
    } catch (error) {
      console.error('Location fetch error:', error);
      setConnectionStatus('error');
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
        return 'Last Known Location (Outdated)';
      case 'connecting':
        return 'Connecting...';
      case 'disconnected':
        return 'Connection Lost';
      case 'inactive':
        return 'Bus Not Active';
      case 'trip_ended':
        return 'Trip Ended';
      default:
        return 'Connection Error';
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

      {/* Location Display */}
      <div className="bg-white rounded-lg shadow border">
        {busLocation && busLocation.lat && busLocation.lng ? (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Navigation className="mr-2 text-blue-600" size={20} />
                Current Location
              </h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                connectionStatus === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-orange-100 text-orange-800'
              }`}>
                {connectionStatus === 'active' ? 'Live' : 'Outdated'}
              </span>
            </div>
            
            {/* Location Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-gray-600">Latitude</p>
                <p className="font-bold text-gray-900">{busLocation.lat.toFixed(6)}</p>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-gray-600">Longitude</p>
                <p className="font-bold text-gray-900">{busLocation.lng.toFixed(6)}</p>
              </div>
              {busLocation.accuracy && (
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-xs text-gray-600">Accuracy</p>
                  <p className="font-bold text-gray-900">±{busLocation.accuracy}m</p>
                </div>
              )}
              {busLocation.speed && (
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <p className="text-xs text-gray-600">Speed</p>
                  <p className="font-bold text-gray-900">{busLocation.speed}km/h</p>
                </div>
              )}
            </div>

            {/* Google Maps Link */}
            <div className="flex space-x-3">
              <a
                href={`https://maps.google.com/?q=${busLocation.lat},${busLocation.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center font-medium"
              >
                Open in Google Maps
              </a>
              <button
                onClick={fetchBusLocation}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                Refresh
              </button>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center">
            {connectionStatus === 'inactive' ? (
              <>
                <AlertCircle size={48} className="mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">Bus Not Active</h3>
                <p className="text-gray-500 mb-4">The bus hasn't started its trip yet.</p>
                <button
                  onClick={fetchBusLocation}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Check Again
                </button>
              </>
            ) : connectionStatus === 'error' ? (
              <>
                <AlertCircle size={48} className="mx-auto mb-4 text-red-400" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">Connection Error</h3>
                <p className="text-gray-500 mb-4">Failed to connect to tracking system.</p>
                <button
                  onClick={fetchBusLocation}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Retry
                </button>
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
        )}
      </div>
    </div>
  );
};

export default SimpleBusTracker;