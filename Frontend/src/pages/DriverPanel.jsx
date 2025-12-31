import React, { useState, useEffect } from 'react';
import { useAuth } from '../Context/AuthContext';
import { useLogout } from '../hooks/useLogout';
import {
  useGetDriverDashboardQuery,
  useUpdateDriverProfileMutation
} from '../store/apiSlice';
import {
  User, Bus, MapPin, Clock, Users, Phone, Mail, Settings,
  Home, Route, Calendar, MessageSquare, CheckCircle, AlertTriangle
} from 'lucide-react';
import LiveTrackingMap from '../components/LiveTrackingMap';
import GPSTest from '../components/GPSTest';
import io from 'socket.io-client';

const DriverPanel = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [socket, setSocket] = useState(null);
  const [profileData, setProfileData] = useState({
    name: '',
    phoneNumber: '',
    address: '',
    emergencyContact: '',
    experience: ''
  });
  const { user } = useAuth();
  const logout = useLogout();

  // RTK Query hooks
  const { data: driverData, isLoading: loading, refetch } = useGetDriverDashboardQuery();
  const [updateProfile, { isLoading: updateLoading }] = useUpdateDriverProfileMutation();

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
      setProfileData({
        name: driver.name || '',
        phoneNumber: driver.phoneNumber || '',
        address: driver.address || '',
        emergencyContact: driver.emergencyContact || '',
        experience: driver.experience || ''
      });
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

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: Home },
    { id: 'tracking', name: 'GPS Tracking', icon: MapPin },
    { id: 'students', name: 'Students', icon: Users },
    { id: 'route', name: 'Route', icon: Route },
    { id: 'profile', name: 'Profile', icon: User }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-600 to-blue-700 rounded-2xl shadow-xl p-8 text-white">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <User className="text-white" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Welcome, {driverData?.data?.driver?.name || 'Driver'}!</h1>
            <p className="text-blue-100 mt-1">{driverData?.data?.driver?.email} • License: {driverData?.data?.driver?.licenseNumber || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Assigned Bus</p>
              <p className="text-2xl font-bold text-blue-600">
                {driverData?.data?.driver?.assignedBus?.busNumber || 'Not Assigned'}
              </p>
            </div>
            <Bus className="text-blue-500" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-green-600">
                {driverData?.data?.stats?.totalStudents || 0}
              </p>
            </div>
            <Users className="text-green-500" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Bus Capacity</p>
              <p className="text-2xl font-bold text-purple-600">
                {driverData?.data?.stats?.busCapacity || 0}
              </p>
            </div>
            <CheckCircle className="text-purple-500" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Available Seats</p>
              <p className="text-2xl font-bold text-orange-600">
                {driverData?.data?.stats?.availableSeats || 0}
              </p>
            </div>
            <AlertTriangle className="text-orange-500" size={32} />
          </div>
        </div>
      </div>

      {/* Bus Information */}
      {driverData?.data?.driver?.assignedBus && (
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Bus className="mr-3 text-blue-600" size={28} />
            Your Assigned Bus
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
              <div className="flex items-center space-x-3 mb-3">
                <Bus className="text-blue-600" size={24} />
                <span className="text-sm font-medium text-gray-600">Bus Number</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{driverData.data.driver.assignedBus.busNumber}</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
              <div className="flex items-center space-x-3 mb-3">
                <Settings className="text-green-600" size={24} />
                <span className="text-sm font-medium text-gray-600">Model</span>
              </div>
              <p className="text-xl font-bold text-gray-900">{driverData.data.driver.assignedBus.model}</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl">
              <div className="flex items-center space-x-3 mb-3">
                <Users className="text-purple-600" size={24} />
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
          <MapPin className="mr-3 text-blue-600" size={28} />
          Live GPS Tracking
        </h2>
        <div className="text-sm text-gray-500">
          Bus: {driverData?.data?.driver?.assignedBus?.busNumber || 'Not Assigned'}
        </div>
      </div>

      {/* GPS Test Component */}
      <GPSTest />

      <LiveTrackingMap
        route={driverData?.data?.assignedRoute}
        busNumber={driverData?.data?.driver?.assignedBus?.busNumber}
        driverId={driverData?.data?.driver?._id}
        socket={socket}
      />
    </div>
  );

  const renderRoute = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Route Information</h2>

      {driverData?.data?.assignedRoute ? (
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Route Details</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Route className="text-blue-600" size={20} />
                  <span className="font-medium">Route Name:</span>
                  <span className="text-gray-700">{driverData.data.assignedRoute.routeName}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="text-green-600" size={20} />
                  <span className="font-medium">Start Time:</span>
                  <span className="text-gray-700">{driverData.data.assignedRoute.startTime}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="text-red-600" size={20} />
                  <span className="font-medium">End Time:</span>
                  <span className="text-gray-700">{driverData.data.assignedRoute.endTime}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Bus Stops</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {driverData.data.assignedRoute.stops?.map((stop, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{stop.stopName}</p>
                      <p className="text-sm text-gray-600">{stop.timing}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <Route className="mx-auto text-gray-400 mb-4" size={64} />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Route Assigned</h3>
          <p className="text-gray-600">Contact admin to get a route assigned to your bus.</p>
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
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold">{student.name?.charAt(0)}</span>
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
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>

      <div className="bg-white rounded-2xl shadow-xl p-8">
        <form onSubmit={handleProfileUpdate} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                value={profileData.phoneNumber}
                onChange={(e) => setProfileData({ ...profileData, phoneNumber: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <input
                type="text"
                value={profileData.address}
                onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact</label>
              <input
                type="tel"
                value={profileData.emergencyContact}
                onChange={(e) => setProfileData({ ...profileData, emergencyContact: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Experience (Years)</label>
              <input
                type="number"
                value={profileData.experience}
                onChange={(e) => setProfileData({ ...profileData, experience: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                min="0"
                max="50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={updateLoading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
          >
            {updateLoading ? 'Updating...' : 'Update Profile'}
          </button>
        </form>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return renderDashboard();
      case 'tracking': return renderTracking();
      case 'students': return renderStudents();
      case 'route': return renderRoute();
      case 'profile': return renderProfile();
      default: return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg border-r border-gray-200 fixed h-full z-10">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-lg">🚌</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Driver Portal</h1>
              <p className="text-xs text-gray-500">Bus Management</p>
            </div>
          </div>
        </div>

        <nav className="mt-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-6 py-3 text-left transition-all ${activeTab === tab.id
                    ? "bg-blue-50 text-blue-600 border-r-2 border-blue-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
              >
                <Icon size={20} />
                <span className="font-medium">{tab.name}</span>
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-6 left-6 right-6">
          {user && (
            <div className="mb-3 p-3 bg-gray-50 rounded-lg border">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'D'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{user.name || 'Driver'}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email || ''}</p>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={logout}
            className="w-full flex items-center space-x-3 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64">
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 capitalize">{activeTab}</h2>
                <p className="text-gray-500 text-sm">
                  {activeTab === 'dashboard' && 'Overview of your driving assignments'}
                  {activeTab === 'tracking' && 'Live GPS tracking and trip management'}
                  {activeTab === 'students' && 'Manage your assigned students'}
                  {activeTab === 'route' && 'View your assigned route details'}
                  {activeTab === 'profile' && 'Manage your profile settings'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default DriverPanel;