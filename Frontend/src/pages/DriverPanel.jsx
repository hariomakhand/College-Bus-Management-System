import React, { useState, useEffect } from 'react';
import { useAuth } from '../Context/AuthContext';
import { useLogout } from '../hooks/useLogout';
import Sidebar from '../components/Sidebar';
import {
  useGetDriverDashboardQuery,
  useUpdateDriverProfileMutation,
  useSendDriverNotificationMutation
} from '../store/apiSlice';
import {
  User, Bus, MapPin, Clock, Users, Phone, Mail, Settings,
  Home, Route, Calendar, MessageSquare, CheckCircle, AlertTriangle, Navigation, Send
} from 'lucide-react';
import LiveTrackingMap from '../components/LiveTrackingMap';
import LocationSyncTest from '../components/LocationSyncTest';

import io from 'socket.io-client';

const DriverPanel = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [socket, setSocket] = useState(null);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState('info');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    phoneNumber: '',
    address: '',
    emergencyContact: '',
    experience: ''
  });
  const { user } = useAuth();
  const logout = useLogout();

  // Mobile screen detection
  useEffect(() => {
    const checkMobile = () => {
      if (window.innerWidth < 1024) { // lg breakpoint
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // RTK Query hooks
  const { data: driverData, isLoading: loading, refetch } = useGetDriverDashboardQuery();
  const [updateProfile, { isLoading: updateLoading }] = useUpdateDriverProfileMutation();
  const [sendNotification, { isLoading: sendingNotification }] = useSendDriverNotificationMutation();

  // Socket.IO connection
  useEffect(() => {
    try {
      const newSocket = io('http://localhost:5001', {
        withCredentials: true,
        timeout: 5000,
        forceNew: true
      });

      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id);
        setSocket(newSocket);

        // Join driver room when bus is assigned
        if (driverData?.data?.driver?.assignedBus?.busNumber) {
          newSocket.emit('join-driver', driverData.data.driver.assignedBus.busNumber);
        }
      });

      newSocket.on('connect_error', (error) => {
        console.log('Socket connection failed:', error.message);
        setSocket(null);
      });

      return () => {
        if (newSocket) {
          newSocket.close();
        }
      };
    } catch (error) {
      console.error('Socket initialization error:', error);
      setSocket(null);
    }
  }, [driverData?.data?.driver?.assignedBus?.busNumber]);

  // Initialize profile data when driver data loads
  React.useEffect(() => {
    if (driverData?.data?.driver) {
      const driver = driverData.data.driver;
      console.log('Driver data loaded:', driverData.data);
      console.log('Assigned route:', driverData.data.assignedRoute);
      
      setProfileData({
        name: driver.name || '',
        phoneNumber: driver.phoneNumber || '',
        address: driver.address || '',
        emergencyContact: driver.emergencyContact || '',
        experience: driver.experience || ''
      });
      
      // Log current location for debugging
      if (driver.currentLocation) {
        console.log('Driver current location:', driver.currentLocation);
      } else {
        console.log('No current location found for driver');
      }
    }
  }, [driverData]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(profileData).unwrap();
      alert('Profile updated successfully!');
      refetch();
    } catch (error) {
      alert('Error updating profile: ' + (error.data?.message || error.message));
    }
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    if (!notificationMessage.trim()) {
      alert('Please enter a notification message');
      return;
    }

    try {
      const result = await sendNotification({
        message: notificationMessage,
        type: notificationType
      }).unwrap();
      
      alert(`Notification sent to ${result.studentsNotified} students successfully!`);
      setNotificationMessage('');
      setNotificationType('info');
    } catch (error) {
      alert('Error sending notification: ' + (error.data?.message || error.message));
    }
  };

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: Home },
    { id: 'tracking', name: 'GPS Tracking', icon: MapPin },
    { id: 'students', name: 'Students', icon: Users },
    { id: 'route', name: 'Route', icon: Route },
    { id: 'notifications', name: 'Notifications', icon: MessageSquare },
    { id: 'profile', name: 'Profile', icon: User }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-yellow-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl shadow-xl p-8 text-white">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-yellow-500 bg-opacity-20 rounded-full flex items-center justify-center overflow-hidden">
            {driverData?.data?.driver?.profileImage?.url ? (
              <img
                src={driverData.data.driver.profileImage.url}
                alt="Driver Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="text-yellow-400" size={32} />
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold">Welcome, {driverData?.data?.driver?.name || 'Driver'}!</h1>
            <p className="text-gray-300 mt-1">{driverData?.data?.driver?.email} • License: {driverData?.data?.driver?.licenseNumber || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Assigned Bus</p>
              <p className="text-2xl font-bold text-gray-900">
                {driverData?.data?.driver?.assignedBus?.busNumber || 'Not Assigned'}
              </p>
            </div>
            <Bus className="text-yellow-500" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-gray-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">
                {driverData?.data?.stats?.totalStudents || 0}
              </p>
            </div>
            <Users className="text-gray-500" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Bus Capacity</p>
              <p className="text-2xl font-bold text-gray-900">
                {driverData?.data?.stats?.busCapacity || 0}
              </p>
            </div>
            <CheckCircle className="text-yellow-600" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-gray-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Available Seats</p>
              <p className="text-2xl font-bold text-gray-900">
                {driverData?.data?.stats?.availableSeats || 0}
              </p>
            </div>
            <AlertTriangle className="text-gray-600" size={32} />
          </div>
        </div>
      </div>

      {/* Bus Information */}
      {driverData?.data?.driver?.assignedBus && (
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Bus className="mr-3 text-yellow-600" size={28} />
            Your Assigned Bus
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-xl">
              <div className="flex items-center space-x-3 mb-3">
                <Bus className="text-yellow-600" size={24} />
                <span className="text-sm font-medium text-gray-600">Bus Number</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{driverData.data.driver.assignedBus.busNumber}</p>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl">
              <div className="flex items-center space-x-3 mb-3">
                <Settings className="text-gray-600" size={24} />
                <span className="text-sm font-medium text-gray-600">Model</span>
              </div>
              <p className="text-xl font-bold text-gray-900">{driverData.data.driver.assignedBus.model}</p>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-xl">
              <div className="flex items-center space-x-3 mb-3">
                <Users className="text-yellow-600" size={24} />
                <span className="text-sm font-medium text-gray-600">Capacity</span>
              </div>
              <p className="text-xl font-bold text-gray-900">{driverData.data.driver.assignedBus.capacity} seats</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderTracking = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <MapPin className="mr-3 text-yellow-600" size={28} />
          Live GPS Tracking
        </h2>
        {driverData?.data?.driver?.assignedBus && (
          <div className="bg-yellow-50 px-4 py-2 rounded-full border border-yellow-200">
            <span className="text-gray-900 font-medium text-sm">
              Bus: {driverData.data.driver.assignedBus.busNumber}
            </span>
          </div>
        )}
      </div>

      {driverData?.data?.driver?.assignedBus ? (
        <div className="space-y-6">
          <LiveTrackingMap
            route={driverData?.data?.assignedRoute}
            busNumber={driverData?.data?.driver?.assignedBus?.busNumber}
            driverId={driverData?.data?.driver?._id}
            socket={socket}
          />
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
          <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <MapPin className="text-gray-400" size={40} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">No Bus Assigned</h3>
          <p className="text-gray-600 mb-6">You need to have a bus assigned to start GPS tracking.</p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 inline-block">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="text-yellow-600" size={18} />
              <span className="text-yellow-800 font-medium text-sm">Contact admin for bus assignment</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderRoute = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <Route className="mr-3 text-yellow-600" size={28} />
          My Route
        </h2>
        {driverData?.data?.assignedRoute && (
          <div className="bg-yellow-50 px-4 py-2 rounded-full border border-yellow-200">
            <span className="text-gray-900 font-medium text-sm">
              {driverData.data.assignedRoute.routeNumber}
            </span>
          </div>
        )}
      </div>

      {driverData?.data?.assignedRoute ? (
        <div className="space-y-6">
          {/* Route Overview */}
          <div className="bg-gradient-to-r from-gray-700 to-gray-800 rounded-2xl p-8 text-white">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2">{driverData.data.assignedRoute.routeName}</h3>
              <p className="text-gray-300">{driverData.data.assignedRoute.startPoint} → {driverData.data.assignedRoute.endPoint}</p>
            </div>
            
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-500 bg-opacity-20 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Clock className="text-yellow-400" size={28} />
                </div>
                <h4 className="text-xl font-bold">{driverData.data.assignedRoute.estimatedTime} min</h4>
                <p className="text-gray-300 text-sm">Duration</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-500 bg-opacity-20 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <MapPin className="text-yellow-400" size={28} />
                </div>
                <h4 className="text-xl font-bold">{driverData.data.assignedRoute.distance} km</h4>
                <p className="text-gray-300 text-sm">Distance</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-500 bg-opacity-20 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Users className="text-yellow-400" size={28} />
                </div>
                <h4 className="text-xl font-bold">{driverData?.data?.stats?.totalStudents || 0}</h4>
                <p className="text-gray-300 text-sm">Students</p>
              </div>
            </div>
          </div>

          {/* Route Details & Stops */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Route Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                <Settings className="mr-3 text-yellow-600" size={20} />
                Route Details
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                  <MapPin className="text-yellow-600" size={18} />
                  <div>
                    <p className="font-medium text-gray-900">Start Point</p>
                    <p className="text-gray-600 text-sm">{driverData.data.assignedRoute.startPoint}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <MapPin className="text-gray-600" size={18} />
                  <div>
                    <p className="font-medium text-gray-900">End Point</p>
                    <p className="text-gray-600 text-sm">{driverData.data.assignedRoute.endPoint}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                  <Clock className="text-yellow-600" size={18} />
                  <div>
                    <p className="font-medium text-gray-900">Operating Hours</p>
                    <p className="text-gray-600 text-sm">
                      {driverData.data.assignedRoute.startTime || '7:00 AM'} - {driverData.data.assignedRoute.endTime || '6:00 PM'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bus Stops */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                  <Users className="mr-3 text-yellow-600" size={20} />
                  Bus Stops
                </h3>
                <span className="bg-yellow-100 text-gray-900 px-3 py-1 rounded-full text-xs font-medium">
                  {driverData.data.assignedRoute.stops?.length || 0} stops
                </span>
              </div>
              
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {driverData.data.assignedRoute.stops?.length > 0 ? (
                  driverData.data.assignedRoute.stops.map((stop, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-yellow-50 transition-colors">
                      <div className="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{stop.stopName}</p>
                        <p className="text-xs text-gray-500 flex items-center">
                          <Clock className="mr-1" size={12} />
                          {stop.timing}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <MapPin className="mx-auto text-gray-300 mb-2" size={32} />
                    <p className="text-gray-500 text-sm">No stops defined</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
              <CheckCircle className="mr-3 text-yellow-600" size={20} />
              Route Summary
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-yellow-50 rounded-xl">
                <div className="text-2xl font-bold text-gray-900">{driverData.data.assignedRoute.stops?.length || 0}</div>
                <div className="text-xs text-gray-600 mt-1">Stops</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <div className="text-2xl font-bold text-gray-900">{driverData.data.assignedRoute.distance}</div>
                <div className="text-xs text-gray-600 mt-1">KM</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-xl">
                <div className="text-2xl font-bold text-gray-900">{driverData.data.assignedRoute.estimatedTime}</div>
                <div className="text-xs text-gray-600 mt-1">Minutes</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <div className="text-2xl font-bold text-gray-900">{driverData?.data?.stats?.totalStudents || 0}</div>
                <div className="text-xs text-gray-600 mt-1">Students</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
          <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Route className="text-gray-400" size={40} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">No Route Assigned</h3>
          <p className="text-gray-600 mb-6">Contact your administrator to get a route assigned.</p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 inline-block">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="text-yellow-600" size={18} />
              <span className="text-yellow-800 font-medium text-sm">Waiting for Assignment</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderStudents = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Assigned Students</h2>

      {driverData?.data?.assignedStudents?.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pickup Stop</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {driverData.data.assignedStudents.map((student, index) => (
                  <tr key={student._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 bg-gray-100">
                          {student.profileImage?.url ? (
                            <img 
                              src={student.profileImage.url} 
                              alt={student.name} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-blue-600 flex items-center justify-center">
                              <span className="text-white font-semibold text-sm">{student.name?.charAt(0)}</span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{student.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.studentId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.preferredPickupStop || 'Not specified'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.phone || 'Not provided'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <Users size={64} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">No Students Assigned</h3>
          <p className="text-gray-600">No students are currently assigned to your bus.</p>
        </div>
      )}
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl shadow-xl p-8 text-white">
        <div className="flex items-center space-x-6">
          <div className="w-24 h-24 bg-yellow-500 bg-opacity-20 rounded-full flex items-center justify-center overflow-hidden">
            {driverData?.data?.driver?.profileImage?.url ? (
              <img
                src={driverData.data.driver.profileImage.url}
                alt="Driver Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="text-yellow-400" size={40} />
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold">{driverData?.data?.driver?.name || 'Driver Profile'}</h1>
            <p className="text-gray-300 mt-2 flex items-center">
              <Mail className="mr-2" size={16} />
              {driverData?.data?.driver?.email}
            </p>
            <p className="text-gray-300 flex items-center mt-1">
              <Settings className="mr-2" size={16} />
              License: {driverData?.data?.driver?.licenseNumber || 'Not provided'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Information Cards */}
        <div className="lg:col-span-1 space-y-6">
          {/* Quick Stats */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <CheckCircle className="mr-3 text-yellow-600" size={20} />
              Profile Status
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Account Status</span>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Bus Assigned</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  driverData?.data?.driver?.assignedBus 
                    ? 'bg-yellow-100 text-gray-900' 
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  {driverData?.data?.driver?.assignedBus?.busNumber || 'Pending'}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Experience</span>
                <span className="bg-gray-100 text-gray-900 px-3 py-1 rounded-full text-xs font-medium">
                  {profileData.experience || '0'} Years
                </span>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <Phone className="mr-3 text-yellow-600" size={20} />
              Contact Info
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Phone className="text-gray-500" size={16} />
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="font-medium text-gray-900">
                    {profileData.phoneNumber || 'Not provided'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <AlertTriangle className="text-gray-500" size={16} />
                <div>
                  <p className="text-xs text-gray-500">Emergency Contact</p>
                  <p className="font-medium text-gray-900">
                    {profileData.emergencyContact || 'Not provided'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <MapPin className="text-gray-500" size={16} />
                <div>
                  <p className="text-xs text-gray-500">Address</p>
                  <p className="font-medium text-gray-900">
                    {profileData.address || 'Not provided'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <Settings className="mr-3 text-yellow-600" size={24} />
                Edit Profile Information
              </h3>
              <div className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleDateString()}
              </div>
            </div>

            <form onSubmit={handleProfileUpdate} className="space-y-6">
              {/* Personal Information Section */}
              <div className="border-b border-gray-200 pb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="mr-2 text-gray-600" size={18} />
                  Personal Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Experience (Years)
                    </label>
                    <div className="relative">
                      <Settings className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="number"
                        value={profileData.experience}
                        onChange={(e) => setProfileData({ ...profileData, experience: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Years of driving experience"
                        min="0"
                        max="50"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information Section */}
              <div className="border-b border-gray-200 pb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Phone className="mr-2 text-gray-600" size={18} />
                  Contact Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="tel"
                        value={profileData.phoneNumber}
                        onChange={(e) => setProfileData({ ...profileData, phoneNumber: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Emergency Contact
                    </label>
                    <div className="relative">
                      <AlertTriangle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="tel"
                        value={profileData.emergencyContact}
                        onChange={(e) => setProfileData({ ...profileData, emergencyContact: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Emergency contact number"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Address Section */}
              <div className="pb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <MapPin className="mr-2 text-gray-600" size={18} />
                  Address Information
                </h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Home Address
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                    <textarea
                      value={profileData.address}
                      onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                      placeholder="Enter your complete address"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <button
                  type="submit"
                  disabled={updateLoading}
                  className="flex-1 bg-gradient-to-r from-gray-700 to-gray-800 text-white py-3 px-6 rounded-lg hover:from-gray-800 hover:to-gray-900 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {updateLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle size={18} />
                      <span>Update Profile</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (driverData?.data?.driver) {
                      const driver = driverData.data.driver;
                      setProfileData({
                        name: driver.name || '',
                        phoneNumber: driver.phoneNumber || '',
                        address: driver.address || '',
                        emergencyContact: driver.emergencyContact || '',
                        experience: driver.experience || ''
                      });
                    }
                  }}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center justify-center space-x-2"
                >
                  <Settings size={18} />
                  <span>Reset</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <MessageSquare className="mr-3 text-yellow-600" size={28} />
          Send Notifications
        </h2>
        <div className="text-sm text-gray-500">
          Send messages to students on your route
        </div>
      </div>

      {driverData?.data?.driver?.assignedBus ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Notification Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Send className="mr-3 text-yellow-600" size={24} />
                Compose Notification
              </h3>

              <form onSubmit={handleSendNotification} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notification Type
                  </label>
                  <select
                    value={notificationType}
                    onChange={(e) => setNotificationType(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="info">Information</option>
                    <option value="warning">Warning</option>
                    <option value="success">Good News</option>
                    <option value="error">Important Alert</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    value={notificationMessage}
                    onChange={(e) => setNotificationMessage(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    placeholder="Type your message to students here..."
                    rows={6}
                    required
                    maxLength={500}
                  />
                  <div className="text-right text-xs text-gray-500 mt-1">
                    {notificationMessage.length}/500 characters
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={sendingNotification || !notificationMessage.trim()}
                  className="w-full bg-gradient-to-r from-gray-700 to-gray-800 text-white py-3 px-6 rounded-lg hover:from-gray-800 hover:to-gray-900 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {sendingNotification ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      <span>Send Notification</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Info Panel */}
          <div className="space-y-6">
            {/* Route Info */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Route className="mr-3 text-yellow-600" size={20} />
                Your Route
              </h3>
              <div className="space-y-3">
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700">Bus Number</p>
                  <p className="text-lg font-bold text-gray-900">
                    {driverData.data.driver.assignedBus.busNumber}
                  </p>
                </div>
                {driverData.data.assignedRoute && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700">Route</p>
                    <p className="text-lg font-bold text-gray-900">
                      {driverData.data.assignedRoute.routeName}
                    </p>
                  </div>
                )}
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700">Students</p>
                  <p className="text-lg font-bold text-gray-900">
                    {driverData.data.stats.totalStudents} registered
                  </p>
                </div>
              </div>
            </div>

            {/* Notification Tips */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <AlertTriangle className="mr-3 text-yellow-600" size={20} />
                Tips
              </h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Keep messages clear and concise</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Use appropriate notification types</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Notify about delays or route changes</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Send emergency alerts when needed</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
          <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <MessageSquare className="text-gray-400" size={40} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">No Bus Assigned</h3>
          <p className="text-gray-600 mb-6">You need to have a bus assigned to send notifications to students.</p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 inline-block">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="text-yellow-600" size={18} />
              <span className="text-yellow-800 font-medium text-sm">Contact admin for bus assignment</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return renderDashboard();
      case 'tracking': return renderTracking();
      case 'students': return renderStudents();
      case 'route': return renderRoute();
      case 'notifications': return renderNotifications();
      case 'profile': return renderProfile();
      default: return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(tabId) => {
          setActiveTab(tabId);
          if (window.innerWidth < 1024) {
            setSidebarOpen(false);
          }
        }}
        user={{ ...user, profileImage: driverData?.data?.driver?.profileImage }}
        onLogout={logout}
        title="Driver Portal"
        subtitle="Bus Management"
        bgColor="bg-gray-800"
        accentColor="bg-yellow-500"
      />

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-64'} ml-0`}>
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 lg:px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Mobile Menu Button */}
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <div>
                  <h2 className="text-xl lg:text-2xl font-bold text-gray-900 capitalize">{activeTab}</h2>
                  <p className="text-gray-500 text-xs lg:text-sm">
                    {activeTab === 'dashboard' && 'Overview of your driving assignments'}
                    {activeTab === 'tracking' && 'Live GPS tracking and trip management'}
                    {activeTab === 'students' && 'Manage your assigned students'}
                    {activeTab === 'route' && 'View your assigned route details'}
                    {activeTab === 'notifications' && 'Send notifications to your route students'}
                    {activeTab === 'profile' && 'Manage your profile settings'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 lg:p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default DriverPanel;