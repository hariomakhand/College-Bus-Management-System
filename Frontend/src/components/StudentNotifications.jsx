import React, { useState, useEffect } from 'react';
import { useAuth } from '../Context/AuthContext';
import { Bell, X, AlertTriangle, CheckCircle, Info, AlertCircle } from 'lucide-react';
import { useGetStudentAnnouncementsQuery } from '../store/apiSlice';
import io from 'socket.io-client';

const StudentNotifications = () => {
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('studentNotifications');
    return saved ? JSON.parse(saved) : [];
  });
  const [socket, setSocket] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [readAnnouncements, setReadAnnouncements] = useState(() => {
    const saved = localStorage.getItem('readAnnouncements');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const { user } = useAuth();
  const { data: announcementsData } = useGetStudentAnnouncementsQuery();
  
  // Helper function to format time ago
  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return timestamp.toLocaleDateString();
  };
  
  // Get recent announcements (last 24 hours) and filter out read ones
  const recentAnnouncements = (announcementsData?.announcements || [])
    .filter(announcement => {
      const announcementTime = new Date(announcement.createdAt);
      const now = new Date();
      const timeDiff = now - announcementTime;
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      return hoursDiff <= 24 && !readAnnouncements.has(announcement._id);
    });

  // Count unread notifications
  const unreadCount = notifications.filter(n => !n.isRead).length + recentAnnouncements.length;

  // Auto-delete notifications older than 24 hours
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setNotifications(prev => {
        const filtered = prev.filter(notification => {
          const notificationTime = new Date(notification.timestamp);
          const hoursDiff = (now - notificationTime) / (1000 * 60 * 60);
          return hoursDiff < 24;
        });
        localStorage.setItem('studentNotifications', JSON.stringify(filtered));
        return filtered;
      });
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('studentNotifications', JSON.stringify(notifications));
  }, [notifications]);

  // Save read announcements to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('readAnnouncements', JSON.stringify([...readAnnouncements]));
  }, [readAnnouncements]);

  useEffect(() => {
    if (!user || user.role !== 'student') return;

    // Initialize socket connection
    const newSocket = io('http://localhost:5001', {
      withCredentials: true,
      timeout: 5000
    });

    newSocket.on('connect', () => {
      console.log('Student notifications socket connected');
      // Join student-specific room
      newSocket.emit('join-student', user.id);
      setSocket(newSocket);
    });

    // Listen for bus-related notifications
    newSocket.on('busDeleted', (data) => {
      addNotification({
        id: Date.now(),
        type: 'warning',
        title: 'Bus Service Discontinued',
        message: data.message,
        timestamp: new Date(data.timestamp),
        autoHide: false,
        from: 'Admin',
        isRead: false,
        showToast: false
      });
      
      // Trigger page refresh to update student data
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    });

    newSocket.on('routeDeleted', (data) => {
      addNotification({
        id: Date.now(),
        type: 'warning',
        title: 'Route Discontinued',
        message: data.message,
        timestamp: new Date(data.timestamp),
        autoHide: false,
        from: 'Admin',
        isRead: false,
        showToast: false
      });
      
      // Trigger page refresh to update student data
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    });

    newSocket.on('driverAssigned', (data) => {
      addNotification({
        id: Date.now(),
        type: 'success',
        title: 'New Driver Assigned',
        message: data.message,
        timestamp: new Date(data.timestamp),
        autoHide: true,
        from: 'Admin',
        isRead: false,
        showToast: false
      });
    });

    newSocket.on('driverUnassigned', (data) => {
      addNotification({
        id: Date.now(),
        type: 'info',
        title: 'Driver Change',
        message: data.message,
        timestamp: new Date(data.timestamp),
        autoHide: false,
        from: 'Admin',
        isRead: false,
        showToast: false
      });
    });

    newSocket.on('busStatusChanged', (data) => {
      const typeMap = {
        'active': 'success',
        'maintenance': 'warning',
        'inactive': 'error'
      };
      
      addNotification({
        id: Date.now(),
        type: typeMap[data.status] || 'info',
        title: 'Bus Status Update',
        message: data.message,
        timestamp: new Date(data.timestamp),
        autoHide: data.status === 'active',
        from: 'Admin',
        isRead: false,
        showToast: false
      });
    });

    newSocket.on('busRequestApproved', (data) => {
      addNotification({
        id: Date.now(),
        type: 'success',
        title: 'Bus Application Approved',
        message: data.message,
        timestamp: new Date(data.timestamp),
        autoHide: false,
        from: 'Admin',
        isRead: false,
        showToast: false
      });
      
      // Refresh page to update student data
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    });

    newSocket.on('busRequestRejected', (data) => {
      addNotification({
        id: Date.now(),
        type: 'error',
        title: 'Bus Application Rejected',
        message: data.message,
        timestamp: new Date(data.timestamp),
        autoHide: false,
        from: 'Admin',
        isRead: false,
        showToast: false
      });
      
      // Refresh page to update student data
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    });

    // Listen for driver notifications - NO TOAST
    newSocket.on('driverNotification', (data) => {
      addNotification({
        id: Date.now(),
        type: data.type || 'info',
        title: data.from || 'Driver Notification',
        message: data.message,
        timestamp: new Date(data.timestamp),
        autoHide: false,
        from: 'Driver',
        isRead: false,
        showToast: false
      });
    });

    newSocket.on('connect_error', (error) => {
      console.error('Student notifications socket error:', error);
    });

    return () => {
      if (newSocket) {
        newSocket.close();
      }
    };
  }, [user]);

  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev]);
    
    // Auto-hide certain notifications after 10 seconds
    if (notification.autoHide) {
      setTimeout(() => {
        removeNotification(notification.id);
      }, 10000);
    }
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  };

  const markAnnouncementAsRead = (announcementId) => {
    setReadAnnouncements(prev => new Set([...prev, announcementId]));
  };

  const handleRightClick = (e, id, isAnnouncement = false) => {
    e.preventDefault();
    if (isAnnouncement) {
      markAnnouncementAsRead(id);
    } else {
      markAsRead(id);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'warning':
        return <AlertTriangle className="text-yellow-500" size={20} />;
      case 'error':
        return <AlertCircle className="text-red-500" size={20} />;
      default:
        return <Info className="text-blue-500" size={20} />;
    }
  };

  const getBackgroundColor = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  if (!user || user.role !== 'student') return null;

  return (
    <>
      {/* Notification Bell */}
      <div className="relative">
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none transition-colors duration-200 hover:bg-gray-100 rounded-full"
        >
          <Bell size={24} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold shadow-lg animate-pulse">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {/* Notifications Dropdown */}
        {showNotifications && (
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-[32rem] overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
                  <p className="text-sm text-gray-600">{unreadCount} unread messages</p>
                </div>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-full transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 && recentAnnouncements.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <Bell className="mx-auto mb-2 text-gray-300" size={32} />
                  <p>No new notifications</p>
                </div>
              ) : (
                <>
                  {/* Real-time notifications */}
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b border-gray-100 ${getBackgroundColor(notification.type)} ${notification.isRead ? 'opacity-60' : ''}`}
                      onContextMenu={(e) => handleRightClick(e, notification.id)}
                      title="Right-click to mark as read"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {getIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <p className="text-sm font-medium text-gray-900">
                                {notification.title}
                              </p>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                notification.from === 'Admin' 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {notification.from}
                              </span>
                              {!notification.isRead && (
                                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                              )}
                            </div>
                            <button
                              onClick={() => removeNotification(notification.id)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <X size={16} />
                            </button>
                          </div>
                          <p className="text-sm text-gray-700 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {notification.timestamp.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}}
                  
                  {/* Recent announcements */}
                  {recentAnnouncements.map((announcement) => (
                    <div
                      key={`announcement-${announcement._id}`}
                      className={`p-4 border-b border-gray-100 ${
                        announcement.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                        announcement.type === 'error' ? 'bg-red-50 border-red-200' :
                        'bg-blue-50 border-blue-200'
                      }`}
                      onContextMenu={(e) => handleRightClick(e, announcement._id, true)}
                      title="Right-click to mark as read"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          <Info className="text-blue-500" size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <p className="text-sm font-medium text-gray-900">
                              {announcement.title}
                            </p>
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Admin
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 mt-1">
                            {announcement.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(announcement.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <button
                          onClick={() => markAnnouncementAsRead(announcement._id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ))}}}
                </>
              )}
            </div>

            {(notifications.filter(n => !n.isRead).length > 0 || recentAnnouncements.length > 0) && (
              <div className="p-3 border-t border-gray-200">
                {notifications.filter(n => !n.isRead).length > 0 && (
                  <button
                    onClick={() => setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))}
                    className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium mb-2"
                  >
                    Mark all as read
                  </button>
                )}
                {recentAnnouncements.length > 0 && (
                  <button
                    onClick={() => setReadAnnouncements(prev => {
                      const newSet = new Set(prev);
                      recentAnnouncements.forEach(ann => newSet.add(ann._id));
                      return newSet;
                    })}
                    className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium mb-2"
                  >
                    Mark all announcements as read
                  </button>
                )}
                <button
                  onClick={() => {
                    setNotifications([]);
                    setReadAnnouncements(new Set());
                  }}
                  className="w-full text-sm text-red-600 hover:text-red-800 font-medium"
                >
                  Clear all notifications
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Toast Notifications - Only for admin notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.filter(n => n.showToast).slice(0, 3).map((notification) => (
          <div
            key={`toast-${notification.id}`}
            className={`max-w-sm w-full ${getBackgroundColor(notification.type)} border rounded-lg shadow-lg p-4 animate-slide-in`}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                {getIcon(notification.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {notification.title}
                </p>
                <p className="text-sm text-gray-700 mt-1">
                  {notification.message}
                </p>
              </div>
              <button
                onClick={() => removeNotification(notification.id)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default StudentNotifications;