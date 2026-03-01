import React, { useState } from 'react';
import { useAuth } from '../Context/AuthContext';
import { useLogout } from '../hooks/useLogout';
import Sidebar from '../components/Sidebar';
import { studentAPI } from '../Api';
import { parseStops } from '../utils/parseStops';
import { getStudentPickupTime } from '../utils/formatTime';
import { 
  useGetStudentDashboardQuery,
  useUpdateStudentProfileMutation,
  useApplyForBusMutation,
  useSendSupportMessageMutation,
  useGetStudentAnnouncementsQuery,
  useRequestRouteChangeMutation
} from '../store/apiSlice';
import { 
  User, CheckCircle, Clock, AlertTriangle, Bus, MapPin, 
  Settings, FileText, Bell, Home, Route, Calendar, MessageSquare,
  Phone, Mail, Search, Navigation, LogOut
} from 'lucide-react';
import ProfilePage from '../components/ProfilePage';
import StudentLocationMap from '../components/StudentLocationMap';
import StudentNotifications from '../components/StudentNotifications';
import RouteApplicationForm from '../components/RouteApplicationForm';
import ChangeRequestModal from '../components/ChangeRequestModal';

const StudentPanel = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [supportData, setSupportData] = useState({ subject: '', message: '' });
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [notificationsViewed, setNotificationsViewed] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showChangeModal, setShowChangeModal] = useState(false);
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
      const response = await studentAPI.getRoutes();
      console.log('Routes API Response:', response.data);
      if (response.data.success) {
        console.log('Routes with buses:', response.data.routes);
        setRoutesData(response.data.routes);
        setRoutesError(null);
      } else {
        setRoutesError(response.data);
      }
    } catch (error) {
      console.error('Routes fetch error:', error);
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
  const [requestRouteChange, { isLoading: changeLoading }] = useRequestRouteChangeMutation();
  
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
      
      const response = await studentAPI.applyForBus({
        routeId,
        pickupStop: pickupStop.trim(),
        reason
      });
      
      const result = response.data;
      
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

  const handleChangeRequest = async () => {
    if (!student?.busRegistrationStatus || student.busRegistrationStatus !== 'approved') {
      alert('You must have an approved bus assignment to request changes.');
      return;
    }

    // Check if there's already a pending change request
    if (student?.changeRequest?.status === 'pending') {
      alert('You already have a pending change request. Please wait for admin response.');
      return;
    }

    const changeType = prompt('What would you like to change?\n1. Route\n2. Pickup Stop\n\nEnter 1 or 2:');
    
    if (!changeType || (changeType !== '1' && changeType !== '2')) {
      return;
    }

    if (changeType === '1') {
      // Change route
      const newRouteId = prompt('Enter new Route ID (check Routes tab):');
      if (!newRouteId) return;

      const newPickupStop = prompt('Enter your preferred pickup stop on the new route:');
      if (!newPickupStop) return;

      const reason = prompt('Reason for route change:');
      if (!reason) return;

      try {
        await requestRouteChange({
          newRouteId,
          newPickupStop,
          reason
        }).unwrap();
        alert('Route change request submitted successfully!');
        refetchDashboard();
      } catch (error) {
        alert('Failed to submit request: ' + (error.data?.message || error.message));
      }
    } else {
      // Change stop only
      const newPickupStop = prompt('Enter your new preferred pickup stop:');
      if (!newPickupStop) return;

      const reason = prompt('Reason for stop change:');
      if (!reason) return;

      try {
        await requestRouteChange({
          newRouteId: student.appliedRouteId,
          newPickupStop,
          reason
        }).unwrap();
        alert('Stop change request submitted successfully!');
        refetchDashboard();
      } catch (error) {
        alert('Failed to submit request: ' + (error.data?.message || error.message));
      }
    }
  };

  if (dashboardLoading) {
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
    <div className="space-y-6">
      {/* Hero Section */}
      {/* <div className="relative overflow-hidden bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-3xl shadow-2xl">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20"></div>
        <div className="relative p-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30 shadow-xl overflow-hidden">
                  {student?.profileImage?.url ? (
                    <img 
                      src={student.profileImage.url} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="text-white" size={32} />
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                  <CheckCircle className="text-white" size={16} />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {student?.name || 'Student'}!</h1>
                <p className="text-yellow-100 mb-1">{student?.email}</p>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-200 text-sm">ID: {student?.studentId || 'STU001'}</span>
                  <span className="w-1 h-1 bg-yellow-300 rounded-full"></span>
                  <span className="text-yellow-200 text-sm">{student?.department || 'Department'}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={() => setActiveTab('profile')}
                className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-300 border border-white/30 shadow-lg flex items-center gap-2"
              >
                <Settings size={16} />
                <span>Edit Profile</span>
              </button>
              {student?.busRegistrationStatus === 'approved' && (
                <button 
                  onClick={() => setActiveTab('tracking')}
                  className="px-6 py-3 bg-yellow-500/90 backdrop-blur-sm text-gray-900 rounded-xl hover:bg-yellow-600/90 transition-all duration-300 shadow-lg flex items-center gap-2 font-semibold"
                >
                  <Navigation size={16} />
                  <span>Track Bus</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div> */}

      {/* Status Cards - Mobile Optimized */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white shadow-lg">
          <div className="flex flex-col items-center text-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-500/20 rounded-lg sm:rounded-xl flex items-center justify-center mb-2 sm:mb-3">
              <Bus className="text-yellow-400" size={20} />
            </div>
            <div className="text-lg sm:text-2xl font-bold mb-1">
              {student?.busRegistrationStatus === 'approved' ? 'Assigned' : 
               student?.busRegistrationStatus === 'pending' ? 'Pending' : 'Not Applied'}
            </div>
            <div className="text-gray-300 text-xs sm:text-sm">Bus Status</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-gray-900 shadow-lg">
          <div className="flex flex-col items-center text-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-800/20 rounded-lg sm:rounded-xl flex items-center justify-center mb-2 sm:mb-3">
              <MapPin className="text-gray-800" size={20} />
            </div>
            <div className="text-sm sm:text-2xl font-bold mb-1 truncate w-full">
              {student?.assignedRoute?.routeName || 'Not Assigned'}
            </div>
            <div className="text-gray-800 text-xs sm:text-sm">Route</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-gray-600 to-gray-700 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white shadow-lg">
          <div className="flex flex-col items-center text-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-500/20 rounded-lg sm:rounded-xl flex items-center justify-center mb-2 sm:mb-3">
              <Clock className="text-yellow-400" size={20} />
            </div>
            <div className="text-lg sm:text-2xl font-bold mb-1">
              {getStudentPickupTime(student?.preferredPickupStop, student?.assignedRoute?.stops) || '8:00 AM'}
            </div>
            <div className="text-gray-300 text-xs sm:text-sm">Pickup Time</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-gray-900 shadow-lg">
          <div className="flex flex-col items-center text-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-800/20 rounded-lg sm:rounded-xl flex items-center justify-center mb-2 sm:mb-3">
              <Navigation className="text-gray-800" size={20} />
            </div>
            <div className="text-sm sm:text-lg font-bold mb-1">
              {student?.busRegistrationStatus === 'approved' ? 'Available' : 'Not Available'}
            </div>
            <div className="text-gray-800 text-xs sm:text-sm">Live Tracking</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {student?.busRegistrationStatus === 'approved' ? (
        <div className="space-y-6">
          {/* Change Request Status */}
          {student?.changeRequest && student.changeRequest.status === 'pending' && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
            <div className="flex items-start">
              <AlertTriangle className="text-yellow-600 mr-3 mt-0.5" size={20} />
              <div className="flex-1">
                <h4 className="font-semibold text-yellow-800 mb-1">Change Request Pending</h4>
                <p className="text-sm text-yellow-700 mb-2">
                  Your {student.changeRequest.type} change request is under review.
                </p>
                <div className="text-xs text-yellow-600">
                  <p><strong>New Stop:</strong> {student.changeRequest.newPickupStop}</p>
                  <p><strong>Reason:</strong> {student.changeRequest.reason}</p>
                  <p><strong>Requested:</strong> {new Date(student.changeRequest.requestDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column - Bus Information */}
          <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                    <Bus className="text-yellow-600" size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Your Assigned Bus</h2>
                    <p className="text-gray-600 text-sm">Bus service details and information</p>
                  </div>
                </div>
                <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  ✓ Active
                </span>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {/* Bus Details */}
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <Bus className="text-yellow-600" size={20} />
                    <span className="font-semibold text-gray-900">Bus Information</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bus Number:</span>
                      <span className="font-bold text-gray-900">{student?.assignedBus?.busNumber || 'BUS-001'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Model:</span>
                      <span className="font-medium text-gray-900">{student?.assignedBus?.model || 'Volvo B7R'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Capacity:</span>
                      <span className="font-medium text-gray-900">{student?.assignedBus?.capacity || 45} seats</span>
                    </div>
                  </div>
                </div>
                
                {/* Route Details */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <MapPin className="text-green-600" size={20} />
                    <span className="font-semibold text-gray-900">Route Information</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Route:</span>
                      <span className="font-bold text-gray-900">{student?.assignedRoute?.routeName || 'Main Campus Route'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pickup Stop:</span>
                      <span className="font-medium text-green-700">{student?.preferredPickupStop || 'Main Gate'}</span>
                    </div>
                  </div>
                </div>

                {/* Driver Details */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                      {student?.assignedDriver?.profileImage?.url ? (
                        <img 
                          src={student.assignedDriver.profileImage.url} 
                          alt={student.assignedDriver.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="text-gray-400" size={16} />
                      )}
                    </div>
                    <span className="font-semibold text-gray-900">Your Driver</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-bold text-gray-900">{student?.assignedDriver?.name || 'John Doe'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone:</span>
                      <span className="font-medium text-blue-600">{student?.assignedDriver?.phone || '+1 234 567 8900'}</span>
                    </div>
                  </div>
                </div>
                
                {/* Quick Actions */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl">
                  <h4 className="font-semibold text-gray-900 mb-3">Quick Actions</h4>
                  <div className="space-y-2">
                    <button 
                      onClick={() => setActiveTab('tracking')}
                      className="w-full flex items-center gap-2 px-3 py-2 bg-white hover:bg-yellow-50 rounded-lg transition-colors text-sm font-medium text-gray-700"
                    >
                      <Navigation size={16} className="text-yellow-600" />
                      Track Bus Live
                    </button>
                    <button 
                      onClick={() => setShowChangeModal(true)}
                      disabled={student?.changeRequest?.status === 'pending'}
                      className="w-full flex items-center gap-2 px-3 py-2 bg-white hover:bg-yellow-50 rounded-lg transition-colors text-sm font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Route size={16} className="text-yellow-600" />
                      {student?.changeRequest?.status === 'pending' ? 'Change Pending' : 'Change Route/Stop'}
                    </button>
                    <button 
                      onClick={() => setActiveTab('support')}
                      className="w-full flex items-center gap-2 px-3 py-2 bg-white hover:bg-yellow-50 rounded-lg transition-colors text-sm font-medium text-gray-700"
                    >
                      <MessageSquare size={16} className="text-yellow-600" />
                      Contact Support
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
          
          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Today's Schedule */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Calendar size={16} className="text-gray-700" />
                  Today's Schedule
                </h3>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div>
                    <div className="font-medium text-gray-900">Morning Pickup</div>
                    <div className="text-sm text-gray-600">
                      {(() => {
                        const pickupTime = getStudentPickupTime(student?.preferredPickupStop, student?.assignedRoute?.stops);
                        const stopName = student?.preferredPickupStop || 'Main Gate';
                        return `${pickupTime || '8:00 AM'} - ${stopName}`;
                      })()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <div className="font-medium text-gray-900">Evening Drop</div>
                    <div className="text-sm text-gray-600">
                      {student?.preferredPickupStop ? `5:00 PM - ${student.preferredPickupStop}` : '5:00 PM - Main Gate'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Bell size={16} className="text-gray-700" />
                  Recent Activity
                </h3>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">Bus application approved</div>
                    <div className="text-xs text-gray-500">2 hours ago</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">Driver assigned</div>
                    <div className="text-xs text-gray-500">1 day ago</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      ) : (
        /* Not Approved State */
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="text-center p-12">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Bus size={32} className="text-yellow-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {student?.busRegistrationStatus === 'pending' ? 'Application Under Review' : 'Get Started with Bus Service'}
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {student?.busRegistrationStatus === 'pending' 
                ? 'Your bus application is being reviewed by our admin team. You will be notified once approved.' 
                : 'Apply for bus routes to start using our transportation service.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {student?.busRegistrationStatus !== 'pending' && (
                <button 
                  onClick={() => setActiveTab('routes')}
                  className="px-8 py-3 bg-yellow-500 text-gray-900 rounded-xl hover:bg-yellow-600 transition-colors font-semibold shadow-lg"
                >
                  Apply for Bus Route
                </button>
              )}
              <button 
                onClick={() => setActiveTab('profile')}
                className="px-8 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
              >
                Update Profile
              </button>
            </div>
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
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>
          )}
        </div>

        {registeredRoute ? (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
              <div className="flex-1">
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">{registeredRoute.routeName}</h3>
                <p className="text-base sm:text-lg text-gray-600">{registeredRoute.routeNumber}</p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                <span className={`px-4 py-2 rounded-full text-sm font-medium text-center ${
                  student?.busRegistrationStatus === 'approved' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {student?.busRegistrationStatus === 'approved' ? '✓ Approved' : '⏳ Pending'}
                </span>
                {student?.busRegistrationStatus === 'approved' && (
                  <button
                    onClick={() => setShowChangeModal(true)}
                    disabled={changeLoading || student?.changeRequest?.status === 'pending'}
                    className="px-4 py-2 bg-yellow-500 text-gray-900 rounded-full text-sm font-medium hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-center"
                  >
                    {student?.changeRequest?.status === 'pending' ? '⏳ Change Pending' : 'Change Route/Stop'}
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-xl">
                  <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <MapPin className="mr-2 text-yellow-600" size={20} />
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
                    <div className="flex justify-between">
                      <span className="text-gray-600">Distance:</span>
                      <span className="font-medium text-gray-900">{registeredRoute.distance || 15} km</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium text-gray-900">{registeredRoute.estimatedTime || 30} mins</span>
                    </div>
                    {student?.preferredPickupStop && (
                      <div className="flex justify-between border-t pt-3 mt-3">
                        <span className="text-gray-600">Your Pickup Stop:</span>
                        <span className="font-medium text-yellow-700">{student.preferredPickupStop}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Assigned Bus & Driver Info */}
                {student?.busRegistrationStatus === 'approved' && (student?.assignedBus || student?.assignedDriver) && (
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl">
                    <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                      <Bus className="mr-2 text-gray-700" size={20} />
                      Your Assigned Bus & Driver
                    </h4>
                    <div className="space-y-4">
                      {student?.assignedBus && (
                        <div className="bg-white p-4 rounded-lg border">
                          <div className="flex items-center space-x-3 mb-2">
                            <Bus className="text-yellow-600" size={16} />
                            <span className="font-semibold text-gray-700">Bus Details</span>
                          </div>
                          <div className="space-y-1 text-sm">
                            <p><span className="text-gray-600">Bus Number:</span> <span className="font-bold text-gray-900">{student.assignedBus.busNumber}</span></p>
                            <p><span className="text-gray-600">Model:</span> <span className="font-medium text-gray-900">{student.assignedBus.model}</span></p>
                            <p><span className="text-gray-600">Capacity:</span> <span className="font-medium text-gray-900">{student.assignedBus.capacity} seats</span></p>
                          </div>
                        </div>
                      )}
                      
                      {student?.assignedDriver && (
                        <div className="bg-white p-4 rounded-lg border">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                              {student.assignedDriver.profileImage?.url ? (
                                <img 
                                  src={student.assignedDriver.profileImage.url} 
                                  alt={student.assignedDriver.name} 
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <User className="text-yellow-600" size={16} />
                              )}
                            </div>
                            <span className="font-semibold text-gray-700">Driver Details</span>
                          </div>
                          <div className="space-y-1 text-sm">
                            <p><span className="text-gray-600">Name:</span> <span className="font-bold text-gray-900">{student.assignedDriver.name}</span></p>
                            <p><span className="text-gray-600">Phone:</span> <span className="font-medium text-blue-600">{student.assignedDriver.phone}</span></p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-6">
                {/* Bus Stops */}
                {registeredRoute.stops && (() => {
                  const stops = parseStops(registeredRoute.stops);
                  if (stops.length === 0) return null;
                  
                  return (
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
                      <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <Bus className="mr-2 text-green-600" size={20} />
                        All Bus Stops ({stops.length})
                      </h4>
                      <div className="space-y-2">
                        {stops.map((stop, index) => (
                          <div 
                            key={index} 
                            className={`p-3 rounded-lg border-l-4 ${
                              stop.name?.toLowerCase() === student?.preferredPickupStop?.toLowerCase()
                                ? 'bg-yellow-100 border-yellow-500 font-semibold'
                                : 'bg-white border-gray-300'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">{stop.name || 'Stop ' + (index + 1)}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">{stop.time || 'N/A'}</span>
                                {stop.name?.toLowerCase() === student?.preferredPickupStop?.toLowerCase() && (
                                  <span className="text-xs bg-yellow-500 text-white px-2 py-1 rounded-full">
                                    Your Stop
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Available Buses on Route */}
                {registeredRoute.buses && registeredRoute.buses.length > 0 && (
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl">
                    <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                      <Bus className="mr-2 text-orange-600" size={20} />
                      All Buses on This Route
                    </h4>
                    <div className="space-y-3">
                      {registeredRoute.buses.map((bus, busIndex) => (
                        <div key={busIndex} className="bg-white p-4 rounded-lg border">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-bold text-gray-900">{bus.busNumber}</p>
                              <p className="text-xs text-gray-600">{bus.model} • {bus.capacity} seats</p>
                            </div>
                            {student?.assignedBus?.busNumber === bus.busNumber && (
                              <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">
                                Your Bus
                              </span>
                            )}
                          </div>
                          {bus.driver && (
                            <div className="border-t pt-2 mt-2">
                              <div className="flex items-center space-x-2 mb-1">
                                <div className="w-4 h-4 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                                  {bus.driver.profileImage?.url ? (
                                    <img 
                                      src={bus.driver.profileImage.url} 
                                      alt={bus.driver.name} 
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <User className="text-blue-600" size={8} />
                                  )}
                                </div>
                                <span className="text-xs font-medium text-gray-600">Driver</span>
                              </div>
                              <p className="text-sm font-medium text-gray-900">{bus.driver.name}</p>
                              <p className="text-xs text-gray-600">{bus.driver.phone}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <>
            {routesLoading ? (
              <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-yellow-600 border-t-transparent mx-auto mb-4"></div>
                <p className="text-gray-600">Loading routes...</p>
              </div>
            ) : filteredRoutes.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
                <Bus size={64} className="mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">No Routes Available</h3>
                <p className="text-gray-600">Please contact admin to add routes.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRoutes.map((route) => {
                  console.log('Rendering route:', route);
                  return (
                  <div key={route._id} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow">
                    {/* Card Header */}
                    <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-1">{route.routeName}</h3>
                          <p className="text-sm text-gray-800 font-medium">{route.routeNumber}</p>
                        </div>
                        <span className="px-3 py-1 bg-green-500 text-white rounded-full text-xs font-bold shadow-sm">
                          ✓ Active
                        </span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 space-y-4">
                      {/* Route Path */}
                      <div className="bg-gray-50 p-3 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="text-yellow-600" size={16} />
                          <span className="text-xs font-semibold text-gray-700">Route Path</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium text-yellow-700">{route.startPoint}</span>
                          <span className="text-gray-400">→</span>
                          <span className="font-medium text-gray-700">{route.endPoint}</span>
                        </div>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-yellow-50 p-3 rounded-xl text-center">
                          <Clock className="text-yellow-600 mx-auto mb-1" size={18} />
                          <p className="text-xs text-gray-600">Duration</p>
                          <p className="text-sm font-bold text-gray-900">{route.estimatedTime || 30} min</p>
                        </div>
                        <div className="bg-yellow-50 p-3 rounded-xl text-center">
                          <MapPin className="text-yellow-600 mx-auto mb-1" size={18} />
                          <p className="text-xs text-gray-600">Distance</p>
                          <p className="text-sm font-bold text-gray-900">{route.distance || 15} km</p>
                        </div>
                      </div>

                      {/* Bus Stops */}
                      {route.stops && (() => {
                        const stops = parseStops(route.stops);
                        if (stops.length === 0) return null;
                        
                        return (
                          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-3 rounded-xl">
                            <div className="flex items-center gap-2 mb-2">
                              <Bus className="text-yellow-600" size={16} />
                              <span className="text-xs font-semibold text-gray-700">Stops ({stops.length})</span>
                            </div>
                            <div className="space-y-1 max-h-32 overflow-y-auto">
                              {stops.slice(0, 3).map((stop, index) => (
                                <div key={index} className="flex items-center justify-between bg-white px-3 py-2 rounded-lg text-xs shadow-sm">
                                  <span className="font-medium text-gray-800">{stop.name || 'Stop ' + (index + 1)}</span>
                                  <span className="text-gray-600">{stop.time || 'N/A'}</span>
                                </div>
                              ))}
                              {stops.length > 3 && (
                                <p className="text-xs text-gray-600 text-center pt-1">+{stops.length - 3} more stops</p>
                              )}
                            </div>
                          </div>
                        );
                      })()}

                      {/* Buses Info */}
                      {route.buses && route.buses.length > 0 && (
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 rounded-xl">
                          <div className="flex items-center gap-2 mb-2">
                            <Bus className="text-purple-600" size={16} />
                            <span className="text-xs font-semibold text-gray-700">Buses ({route.buses.length})</span>
                          </div>
                          <div className="space-y-2">
                            {route.buses.slice(0, 2).map((bus, busIndex) => (
                              <div key={busIndex} className="bg-white p-3 rounded-lg shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                  <p className="font-bold text-gray-900 text-sm">{bus.busNumber}</p>
                                  <p className="text-xs text-gray-600">{bus.capacity} seats</p>
                                </div>
                                {bus.driver && (
                                  <div className="flex items-center gap-2 pt-2 border-t">
                                    <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                                      {bus.driver.profileImage?.url ? (
                                        <img 
                                          src={bus.driver.profileImage.url} 
                                          alt={bus.driver.name} 
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <User className="text-blue-600" size={12} />
                                      )}
                                    </div>
                                    <div className="flex-1">
                                      <p className="text-xs font-medium text-gray-900">{bus.driver.name}</p>
                                      <p className="text-xs text-gray-600">{bus.driver.phone}</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                            {route.buses.length > 2 && (
                              <p className="text-xs text-gray-600 text-center">+{route.buses.length - 2} more buses</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Card Footer */}
                    <div className="p-4 bg-gray-50 border-t">
                      <button
                        onClick={() => {
                          if (!student?.isApproved) {
                            alert('Registration approval required! Please complete your profile and wait for admin approval.');
                            return;
                          }
                          setShowApplyModal(true);
                        }}
                        disabled={applyLoading || !student?.isApproved}
                        className={`w-full py-3 px-4 rounded-xl transition-all font-semibold text-sm shadow-md ${
                          !student?.isApproved 
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                            : 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 hover:from-yellow-500 hover:to-yellow-600 active:scale-95'
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
                  </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  const renderTracking = () => {
    const busNumber = student?.assignedBus?.busNumber || student?.assignedDriver?.assignedBus?.busNumber;
    
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Live Bus Tracking</h2>
        
        {student?.busRegistrationStatus === 'approved' && busNumber ? (
          <div className="space-y-4">
            {/* Driver & Bus Info */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="mr-2 text-blue-600" size={20} />
                Your Assigned Driver & Bus
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {student?.assignedDriver && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                        {student.assignedDriver.profileImage?.url ? (
                          <img 
                            src={student.assignedDriver.profileImage.url} 
                            alt={student.assignedDriver.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="text-gray-400" size={20} />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{student.assignedDriver.name}</p>
                        <p className="text-sm text-gray-600">Driver</p>
                      </div>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-gray-600">Phone:</span> <span className="font-medium text-blue-600">{student.assignedDriver.phone}</span></p>
                      <p><span className="text-gray-600">License:</span> <span className="font-medium text-gray-900">{student.assignedDriver.licenseNumber}</span></p>
                    </div>
                  </div>
                )}
                
                {student?.assignedBus && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-3 mb-2">
                      <Bus className="text-green-600" size={20} />
                      <div>
                        <p className="font-semibold text-gray-900">{student.assignedBus.busNumber}</p>
                        <p className="text-sm text-gray-600">Your Bus</p>
                      </div>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-gray-600">Model:</span> <span className="font-medium text-gray-900">{student.assignedBus.model}</span></p>
                      <p><span className="text-gray-600">Capacity:</span> <span className="font-medium text-gray-900">{student.assignedBus.capacity} seats</span></p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Live Tracking */}
            <StudentLocationMap 
              busNumber={busNumber} 
              studentStop={(() => {
                if (!student?.preferredPickupStop || !student?.assignedRoute?.stops) return null;
                const stops = parseStops(student.assignedRoute.stops);
                return stops.find(s => 
                  s.name?.toLowerCase().trim() === student.preferredPickupStop?.toLowerCase().trim()
                );
              })()}
              route={student?.assignedRoute}
            />
          </div>
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
              className="px-6 py-3 bg-yellow-500 text-gray-900 rounded-lg hover:bg-yellow-600 transition-colors font-semibold"
            >
              {student?.busRegistrationStatus === 'pending' ? 'View Application Status' : 'Apply for Bus Route'}
            </button>
          </div>
        )}
      </div>
    );
  };

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
    <div className="space-y-4">
      <ProfilePage 
        userData={student}
        onUpdateProfile={async (formData) => {
          try {
            // If it's just a refresh request (after image upload)
            if (formData.refreshOnly) {
              refetchDashboard();
              return;
            }
            
            await updateProfile(formData).unwrap();
            alert('Profile updated successfully! Your registration will be reviewed by admin.');
            refetchDashboard();
          } catch (error) {
            alert('Failed to update profile: ' + (error.data?.message || error.message));
          }
        }}
        isLoading={updateLoading}
      />
      
      {/* Mobile Logout Button */}
      <div className="lg:hidden bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold hover:from-red-600 hover:to-red-700 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>
    </div>
  );

  const renderSupport = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Support & Help</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Support</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <Phone className="text-yellow-600" size={20} />
              <div>
                <p className="font-medium text-gray-900">Phone Support</p>
                <p className="text-sm text-gray-600">+1 (555) 123-4567</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <Mail className="text-yellow-600" size={20} />
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
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500" 
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
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                required
              />
            </div>
            <button 
              type="submit"
              disabled={supportLoading}
              className="w-full bg-yellow-500 text-white py-3 rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50 font-semibold"
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
      case 'profile': return renderProfile();
      case 'support': return renderSupport();
      default: return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex pb-20 md:pb-0">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar - Hidden on mobile */}
      <div className="hidden lg:block">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={(tabId) => {
            setActiveTab(tabId);
            setSidebarOpen(false);
          }}
          user={{ ...user, profileImage: student?.profileImage }}
          onLogout={logout}
          title="Student Portal"
          subtitle="Bus Management"
          bgColor="bg-gray-800"
          accentColor="bg-yellow-500"
        />
      </div>

      <div className="flex-1 lg:ml-64">
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 capitalize">{activeTab}</h2>
                <p className="text-gray-500 text-sm">
                  {activeTab === 'dashboard' && 'Overview of your bus service'}
                  {activeTab === 'routes' && 'Browse available bus routes'}
                  {activeTab === 'tracking' && 'Track your bus in real-time'}
                  {activeTab === 'profile' && 'Manage your profile settings'}
                  {activeTab === 'support' && 'Get help and support'}
                </p>
              </div>
              {/* Back Buttons */}
              <div className="flex items-center gap-2">
                {activeTab === 'dashboard' ? (
                  <a
                    href="/"
                    className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-yellow-50 transition-colors flex items-center gap-2"
                  >
                    <Home size={20} />
                    <span className="hidden sm:inline">Back to Home</span>
                  </a>
                ) : (
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-yellow-50 transition-colors flex items-center gap-2"
                  >
                    <Home size={20} />
                    <span className="hidden sm:inline">Back to Dashboard</span>
                  </button>
                )}
                <StudentNotifications />
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

      {showApplyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">Apply for Bus Route</h3>
              <button 
                onClick={() => setShowApplyModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <RouteApplicationForm onSuccess={() => {
                setShowApplyModal(false);
                setActiveTab('my-applications');
              }} />
            </div>
          </div>
        </div>
      )}

      {showChangeModal && (
        <ChangeRequestModal
          student={student}
          onClose={() => setShowChangeModal(false)}
          onSuccess={() => {
            refetchDashboard();
            setShowChangeModal(false);
          }}
        />
      )}

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-30 lg:hidden">
        <div className="flex justify-around items-center h-16">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                  isActive 
                    ? 'text-yellow-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon size={22} className={isActive ? 'mb-1' : 'mb-1'} />
                <span className={`text-xs font-medium ${
                  isActive ? 'font-semibold' : ''
                }`}>
                  {tab.name === 'Live Tracking' ? 'Track' : tab.name}
                </span>
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-yellow-500 rounded-t-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StudentPanel;