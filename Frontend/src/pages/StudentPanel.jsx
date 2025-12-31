import React, { useState } from 'react';
import { useAuth } from '../Context/AuthContext';
import { useLogout } from '../hooks/useLogout';
import { 
  useGetStudentDashboardQuery,
  useUpdateStudentProfileMutation,
  useApplyForBusMutation,
  useSendSupportMessageMutation,
  useGetStudentAnnouncementsQuery
} from '../store/apiSlice';
import { 
  User, CheckCircle, Clock, AlertTriangle, Bus, MapPin, 
  Settings, FileText, Bell, Home, Route, Calendar, MessageSquare,
  Phone, Mail, Search
} from 'lucide-react';
import ProfilePage from '../components/ProfilePage';
import BusLocationTracker from '../components/BusLocationTracker';

const StudentPanel = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [supportData, setSupportData] = useState({ subject: '', message: '' });
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [notificationsViewed, setNotificationsViewed] = useState(false);
  const { user } = useAuth();
  const logout = useLogout();
  
  // API hooks
  const { data: dashboardData, isLoading: dashboardLoading, refetch: refetchDashboard } = useGetStudentDashboardQuery();
  const studentData = dashboardData?.data || {};
  const dynamicStudent = studentData.student || user;
  
  const [routesData, setRoutesData] = useState(null);
  const [routesError, setRoutesError] = useState(null);
  const [routesLoading, setRoutesLoading] = useState(true);
  
  // Fetch routes directly
  const fetchRoutes = async () => {
    try {
      setRoutesLoading(true);
      const response = await fetch('http://localhost:5001/api/student/routes');
      const data = await response.json();
      if (data.success) {
        setRoutesData(data.routes);
        setRoutesError(null);
      } else {
        setRoutesError(data);
      }
    } catch (error) {
      setRoutesError(error);
    } finally {
      setRoutesLoading(false);
    }
  };
  
  React.useEffect(() => {
    fetchRoutes();
  }, []);

  const { data: announcementsData } = useGetStudentAnnouncementsQuery();
  const [updateProfile, { isLoading: updateLoading }] = useUpdateStudentProfileMutation();
  const [applyForBus, { isLoading: applyLoading }] = useApplyForBusMutation();
  const [sendSupport, { isLoading: supportLoading }] = useSendSupportMessageMutation();
  
  const routes = routesData || [];
  const allAnnouncements = announcementsData?.announcements || [];
  
  const recentAnnouncements = allAnnouncements.filter(announcement => {
    const announcementTime = new Date(announcement.createdAt);
    const now = new Date();
    const timeDiff = now - announcementTime;
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    return hoursDiff <= 24;
  });

  const student = dynamicStudent;

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: Home },
    { id: 'routes', name: 'Routes', icon: Route },
    { id: 'tracking', name: 'Live Tracking', icon: MapPin },
    { id: 'schedule', name: 'Schedule', icon: Calendar },
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'support', name: 'Support', icon: MessageSquare }
  ];

  const getStatusBadge = () => {
    if (student?.isApproved) {
      return { color: 'bg-green-100 text-green-800', text: 'Approved', icon: CheckCircle };
    } else if (student?.isRejected) {
      return { color: 'bg-red-100 text-red-800', text: 'Rejected', icon: AlertTriangle };
    } else if (student?.isApproved === false && student?.isRejected === false) {
      return { color: 'bg-yellow-100 text-yellow-800', text: 'Pending Approval', icon: Clock };
    } else {
      return { color: 'bg-gray-100 text-gray-800', text: 'Not Registered', icon: Clock };
    }
  };

  const statusBadge = getStatusBadge();
  const StatusIcon = statusBadge.icon;

  const filteredRoutes = routes.filter(route => 
    route.routeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.routeNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBusApplication = async (routeId) => {
    if (!student?.isApproved) {
      alert('You must be approved by admin before applying for bus routes.');
      return;
    }

    try {
      const pickupStop = prompt('Enter your preferred pickup stop:');
      if (!pickupStop || pickupStop.trim() === '') {
        alert('Pickup stop is required!');
        return;
      }

      const reason = prompt('Enter reason for bus application (optional):') || 'Regular commute to campus';
      
      const response = await fetch('http://localhost:5001/api/student/apply-bus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          routeId,
          pickupStop: pickupStop.trim(),
          reason
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert(result.message || 'Bus application submitted successfully!');
        refetchDashboard();
      } else {
        alert('Failed to apply: ' + result.message);
      }
    } catch (error) {
      alert('Failed to apply: ' + error.message);
    }
  };

  const handleSupportSubmit = async (e) => {
    e.preventDefault();
    try {
      await sendSupport(supportData).unwrap();
      alert('Support message sent successfully!');
      setSupportData({ subject: '', message: '' });
    } catch (error) {
      alert('Failed to send message: ' + (error.data?.message || error.message));
    }
  };

  if (dashboardLoading) {
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
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-xl p-8 text-white">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <User className="text-white" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {student?.name || 'Student'}!</h1>
            <p className="text-blue-100 mt-1">{student?.email} • ID: {student?.studentId || 'STU001'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Bus Status</p>
              <p className="text-2xl font-bold text-green-600">
                {student?.busRegistrationStatus === 'approved' ? 'Assigned' : 
                 student?.busRegistrationStatus === 'pending' ? 'Pending' : 'Not Applied'}
              </p>
            </div>
            <Bus className="text-green-500" size={32} />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Route</p>
              <p className="text-2xl font-bold text-blue-600">
                {student?.assignedRoute?.routeName || 'Not Assigned'}
              </p>
            </div>
            <MapPin className="text-blue-500" size={32} />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pickup Time</p>
              <p className="text-2xl font-bold text-purple-600">
                {student?.assignedRoute?.pickupTime || '8:00 AM'}
              </p>
            </div>
            <Clock className="text-purple-500" size={32} />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Registration</p>
              <p className="text-lg font-bold text-orange-600">{statusBadge.text}</p>
            </div>
            <StatusIcon className="text-orange-500" size={32} />
          </div>
        </div>
      </div>

      {student?.busRegistrationStatus === 'approved' && (
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Bus className="mr-3 text-green-600" size={28} />
              Your Assigned Bus
            </h2>
            <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              ✓ Bus Assigned - Approved
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
              <div className="flex items-center space-x-3 mb-3">
                <Bus className="text-blue-600" size={24} />
                <span className="text-sm font-medium text-gray-600">Bus Number</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{student?.assignedBus?.busNumber || 'BUS-001'}</p>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
              <div className="flex items-center space-x-3 mb-3">
                <MapPin className="text-green-600" size={24} />
                <span className="text-sm font-medium text-gray-600">Route Name</span>
              </div>
              <p className="text-xl font-bold text-gray-900">{student?.assignedRoute?.routeName || 'Main Campus Route'}</p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl">
              <div className="flex items-center space-x-3 mb-3">
                <MapPin className="text-purple-600" size={24} />
                <span className="text-sm font-medium text-gray-600">Pickup Stop</span>
              </div>
              <p className="text-xl font-bold text-gray-900">{student?.preferredPickupStop || 'Main Gate'}</p>
            </div>
          </div>
          
          <div className="mt-6 flex space-x-4">
            <button 
              onClick={() => setActiveTab('tracking')}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Track Bus Live
            </button>
            <button 
              onClick={() => setActiveTab('support')}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Contact Support
            </button>
          </div>
        </div>
      )}

      {student?.busRegistrationStatus !== 'approved' && (
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={() => setActiveTab('routes')}
              className="flex items-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <FileText className="text-blue-600" size={20} />
              <span className="text-blue-600 font-medium">Apply for Bus</span>
            </button>
            <button 
              onClick={() => setActiveTab('profile')}
              className="flex items-center space-x-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
            >
              <Settings className="text-purple-600" size={20} />
              <span className="text-purple-600 font-medium">Update Profile</span>
            </button>
            <button 
              onClick={() => setActiveTab('support')}
              className="flex items-center space-x-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
            >
              <MessageSquare className="text-green-600" size={20} />
              <span className="text-green-600 font-medium">Get Support</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderRoutes = () => {
    const registeredRoute = routes.find(route => 
      student?.appliedRouteId === route._id && 
      (student?.busRegistrationStatus === 'pending' || student?.busRegistrationStatus === 'approved')
    );

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {registeredRoute ? 'Your Registered Route' : 'Available Routes'}
            </h2>
          </div>
          {!registeredRoute && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search routes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}
        </div>

        {registeredRoute ? (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-3xl font-bold text-gray-900">{registeredRoute.routeName}</h3>
                <p className="text-lg text-gray-600">{registeredRoute.routeNumber}</p>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                student?.busRegistrationStatus === 'approved' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {student?.busRegistrationStatus === 'approved' ? '✓ Approved' : '⏳ Pending'}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
                  <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <MapPin className="mr-2 text-blue-600" size={20} />
                    Route Information
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Start Point:</span>
                      <span className="font-medium text-gray-900">{registeredRoute.startPoint}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">End Point:</span>
                      <span className="font-medium text-gray-900">{registeredRoute.endPoint}</span>
                    </div>
                    {student?.preferredPickupStop && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Your Pickup Stop:</span>
                        <span className="font-medium text-green-700">{student.preferredPickupStop}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {routesLoading ? (
              <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                <p className="text-gray-600">Loading routes...</p>
              </div>
            ) : filteredRoutes.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
                <Bus size={64} className="mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">No Routes Available</h3>
                <p className="text-gray-600">Please contact admin to add routes.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRoutes.map((route) => (
                  <div key={route._id} className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{route.routeName}</h3>
                        <p className="text-sm text-gray-600">{route.routeNumber}</p>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        Active
                      </span>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center space-x-2">
                        <MapPin className="text-blue-600" size={16} />
                        <span className="text-sm text-gray-700">{route.startPoint} → {route.endPoint}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="text-green-600" size={16} />
                        <span className="text-sm text-gray-700">{route.estimatedTime} mins</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (!student?.isApproved) {
                          alert('Registration approval required! Please complete your profile and wait for admin approval.');
                          return;
                        }
                        handleBusApplication(route._id);
                      }}
                      disabled={applyLoading || !student?.isApproved}
                      className={`w-full py-2 px-4 rounded-lg transition-colors text-sm ${
                        !student?.isApproved 
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      } disabled:opacity-50`}
                    >
                      {!student?.isApproved 
                        ? '🔒 Approval Required' 
                        : applyLoading 
                          ? 'Applying...' 
                          : 'Apply for This Route'
                      }
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  const renderTracking = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Live Bus Tracking</h2>
      
      {student?.busRegistrationStatus === 'approved' && student?.assignedBus?.busNumber ? (
        <BusLocationTracker busNumber={student.assignedBus.busNumber} />
      ) : (
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <MapPin size={64} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">No Bus Assigned</h3>
          <p className="text-gray-600 mb-4">
            {student?.busRegistrationStatus === 'pending' 
              ? 'Your bus application is pending approval. Live tracking will be available once approved.' 
              : 'Please apply for a bus route to access live tracking.'}
          </p>
          <button 
            onClick={() => setActiveTab('routes')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {student?.busRegistrationStatus === 'pending' ? 'View Application Status' : 'Apply for Bus Route'}
          </button>
        </div>
      )}
    </div>
  );

  const renderSchedule = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Weekly Schedule</h2>
      
      <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
        <Calendar size={64} className="mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-bold text-gray-900 mb-2">No Schedule Available</h3>
        <p className="text-gray-600">Please apply for a bus route to view your schedule.</p>
      </div>
    </div>
  );

  const renderProfile = () => (
    <ProfilePage 
      userData={student}
      onUpdateProfile={async (formData) => {
        try {
          await updateProfile(formData).unwrap();
          alert('Profile updated successfully! Your registration will be reviewed by admin.');
          refetchDashboard();
        } catch (error) {
          alert('Failed to update profile: ' + (error.data?.message || error.message));
        }
      }}
      isLoading={updateLoading}
    />
  );

  const renderSupport = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Support & Help</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Support</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <Phone className="text-blue-600" size={20} />
              <div>
                <p className="font-medium text-gray-900">Phone Support</p>
                <p className="text-sm text-gray-600">+1 (555) 123-4567</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <Mail className="text-green-600" size={20} />
              <div>
                <p className="font-medium text-gray-900">Email Support</p>
                <p className="text-sm text-gray-600">support@busservice.com</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Send Message</h3>
          <form onSubmit={handleSupportSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <input 
                type="text" 
                value={supportData.subject}
                onChange={(e) => setSupportData({...supportData, subject: e.target.value})}
                placeholder="Enter subject" 
                className="w-full p-3 border border-gray-300 rounded-lg" 
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea 
                rows={4} 
                value={supportData.message}
                onChange={(e) => setSupportData({...supportData, message: e.target.value})}
                placeholder="Enter your message" 
                className="w-full p-3 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <button 
              type="submit"
              disabled={supportLoading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {supportLoading ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard': return renderDashboard();
      case 'routes': return renderRoutes();
      case 'tracking': return renderTracking();
      case 'schedule': return renderSchedule();
      case 'profile': return renderProfile();
      case 'support': return renderSupport();
      default: return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="w-64 bg-white shadow-lg border-r border-gray-200 fixed h-full z-10">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-lg">🎓</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Student Portal</h1>
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
                className={`w-full flex items-center space-x-3 px-6 py-3 text-left transition-all ${
                  activeTab === tab.id
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
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'S'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.name || 'Student'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user.email || ''}
                  </p>
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

      <div className="flex-1 ml-64">
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 capitalize">{activeTab}</h2>
                <p className="text-gray-500 text-sm">
                  {activeTab === 'dashboard' && 'Overview of your bus service'}
                  {activeTab === 'routes' && 'Browse available bus routes'}
                  {activeTab === 'tracking' && 'Track your bus in real-time'}
                  {activeTab === 'schedule' && 'View your weekly schedule'}
                  {activeTab === 'profile' && 'Manage your profile settings'}
                  {activeTab === 'support' && 'Get help and support'}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => {
                    setShowAnnouncementModal(true);
                    setNotificationsViewed(true);
                  }}
                  className="p-2 text-gray-600 hover:text-gray-900 relative"
                >
                  <Bell size={20} />
                  {recentAnnouncements.length > 0 && !notificationsViewed && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                      {recentAnnouncements.length}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          {renderContent()}
        </div>
      </div>
      
      {showAnnouncementModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">Recent Announcements</h3>
                <button 
                  onClick={() => setShowAnnouncementModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-96">
              {recentAnnouncements.length > 0 ? (
                <div className="space-y-4">
                  {recentAnnouncements.map((announcement, index) => (
                    <div key={index} className={`p-4 rounded-lg border-l-4 ${
                      announcement.type === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                      announcement.type === 'error' ? 'bg-red-50 border-red-400' :
                      'bg-blue-50 border-blue-400'
                    }`}>
                      <h4 className="font-medium text-gray-900 mb-2">{announcement.title}</h4>
                      <p className="text-sm text-gray-700 mb-2">{announcement.message}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(announcement.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Bell size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No recent announcements (last 24 hours)</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentPanel;