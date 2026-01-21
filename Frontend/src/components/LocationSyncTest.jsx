import React, { useState, useEffect } from 'react';
import { MapPin, Navigation } from 'lucide-react';
import io from 'socket.io-client';

const LocationSyncTest = ({ userType }) => {
  const [location, setLocation] = useState(null);
  const [socket, setSocket] = useState(null);
  const [status, setStatus] = useState('disconnected');
  
  const TEST_BUS_NUMBER = 'BUS-001'; // Hardcoded for testing

  useEffect(() => {
    const newSocket = io('http://localhost:5001', {
      withCredentials: true,
      timeout: 5000
    });

    newSocket.on('connect', () => {
      console.log(`${userType} socket connected`);
      setStatus('connected');
      setSocket(newSocket);
      
      // Both join the same room
      newSocket.emit('join-bus-tracking', TEST_BUS_NUMBER);
      console.log(`${userType} joined room: bus-${TEST_BUS_NUMBER}`);
    });

    newSocket.on('busLocationUpdate', (data) => {
      console.log(`${userType} received location:`, data);
      if (data.busNumber === TEST_BUS_NUMBER) {
        setLocation(data.location);
        setStatus('active');
      }
    });

    return () => {
      if (newSocket) {
        newSocket.close();
      }
    };
  }, [userType]);

  const sendTestLocation = () => {
    if (!socket) return;
    
    const testLocation = {
      lat: 28.6139 + (Math.random() - 0.5) * 0.01,
      lng: 77.2090 + (Math.random() - 0.5) * 0.01
    };

    // Send to backend
    fetch('http://localhost:5001/api/driver/update-location', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        busNumber: TEST_BUS_NUMBER,
        location: testLocation,
        tripStatus: 'active'
      })
    }).then(() => {
      console.log(`${userType} sent location:`, testLocation);
    });
  };

  return (
    <div className="bg-white p-4 rounded-lg border">
      <h3 className="font-bold mb-2">{userType} Location Test</h3>
      
      <div className="space-y-2 text-sm">
        <p>Status: <span className={status === 'active' ? 'text-green-600' : 'text-red-600'}>{status}</span></p>
        <p>Bus: {TEST_BUS_NUMBER}</p>
        
        {location && (
          <div>
            <p>Lat: {location.lat?.toFixed(6)}</p>
            <p>Lng: {location.lng?.toFixed(6)}</p>
          </div>
        )}
      </div>

      {userType === 'Driver' && (
        <button
          onClick={sendTestLocation}
          className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-sm"
        >
          Send Test Location
        </button>
      )}
    </div>
  );
};

export default LocationSyncTest;