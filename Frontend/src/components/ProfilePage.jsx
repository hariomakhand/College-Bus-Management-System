import React, { useState } from 'react';
import { 
  User, Mail, Phone, Home, Calendar, Settings, Edit3, 
  CheckCircle, Clock, AlertTriangle, CreditCard, MapPin,
  Shield, Award, BookOpen, Users
} from 'lucide-react';
import ProfileModal from './ProfileModal';

const ProfilePage = ({ userData, onUpdateProfile, isLoading }) => {
  const [showEditModal, setShowEditModal] = useState(false);

  const getStatusBadge = () => {
    if (userData?.isApproved) {
      return { color: 'bg-green-100 text-green-800 border-green-200', text: 'Approved', icon: CheckCircle };
    } else if (userData?.isRejected) {
      return { color: 'bg-red-100 text-red-800 border-red-200', text: 'Rejected', icon: AlertTriangle };
    } else if (userData?.isApproved === false && userData?.isRejected === false) {
      return { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', text: 'Pending Approval', icon: Clock };
    } else {
      return { color:'bg-gray-100 text-gray-800 border-gray-200', text: 'Not Registered', icon: Clock };
    }
  };

  const statusBadge = getStatusBadge();
  const StatusIcon = statusBadge.icon;

  const handleSaveProfile = async (formData) => {
    try {
      // If it's just a refresh request (after image upload)
      if (formData.refreshOnly) {
        await onUpdateProfile({ refreshOnly: true });
        return;
      }
      
      await onUpdateProfile(formData);
      setShowEditModal(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-white-600  bg-gray-600 to-black-100 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden">
        
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white bg-opacity-20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white border-opacity-30 shadow-xl overflow-hidden">
                {userData?.profileImage?.url ? (
                  <img 
                    src={userData.profileImage.url} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="text-white" size={32} />
                )}
              </div>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-1">{userData?.name || 'Student Name'}</h1>
              <p className="text-blue-100 text-sm sm:text-base mb-1">{userData?.email}</p>
              <p className="text-blue-200 text-xs sm:text-sm">Student ID: {userData?.studentId || 'Not assigned'}</p>
            </div>
          </div>
          <button
            onClick={() => setShowEditModal(true)}
            className="flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-yellow bg-opacity-20 backdrop-blur-sm text-white rounded-xl hover:bg-opacity-30 transition-all duration-300 border border-white border-opacity-30 shadow-lg group text-sm sm:text-base"
          >
            <Edit3 size={16} className="group-hover:rotate-12 transition-transform" />
            <span className="font-semibold">Edit Profile</span>
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal Information - Takes 2 columns on large screens */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information Card */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 sm:px-6 py-4 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <User className="text-blue-600" size={16} />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Personal Information</h2>
              </div>
            </div>
            
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-700 uppercase tracking-wide">
                    <User size={14} className="text-blue-600" />
                    Full Name
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="text-gray-900 font-semibold">{userData?.name || 'Not provided'}</p>
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-700 uppercase tracking-wide">
                    <Mail size={14} className="text-blue-600" />
                    Email Address
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="text-gray-900 font-semibold text-sm">{userData?.email || 'Not provided'}</p>
                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                      <CheckCircle size={10} />
                      Verified
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-700 uppercase tracking-wide">
                    <Phone size={14} className="text-blue-600" />
                    Phone Number
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="text-gray-900 font-semibold">{userData?.phone || 'Not provided'}</p>
                  </div>
                </div>

                {/* Student ID */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-700 uppercase tracking-wide">
                    <CreditCard size={14} className="text-blue-600" />
                    Student ID
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="text-gray-900 font-mono font-bold">{userData?.studentId || 'Not assigned'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Academic Information Card */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-4 sm:px-6 py-4 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="text-purple-600" size={16} />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Academic Information</h2>
              </div>
            </div>
            
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {/* Department */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-700 uppercase tracking-wide">
                    <Settings size={14} className="text-purple-600" />
                    Department
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="text-gray-900 font-semibold">{userData?.department || 'Not specified'}</p>
                  </div>
                </div>

                {/* Academic Year */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-700 uppercase tracking-wide">
                    <Calendar size={14} className="text-purple-600" />
                    Academic Year
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="text-gray-900 font-semibold">{userData?.year || 'Not specified'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information Card */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-4 sm:px-6 py-4 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <MapPin className="text-green-600" size={16} />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Contact Information</h2>
              </div>
            </div>
            
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Address */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold text-gray-700 uppercase tracking-wide">
                  <Home size={14} className="text-green-600" />
                  Home Address
                </label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-gray-900 font-medium leading-relaxed text-sm">{userData?.address || 'Not provided'}</p>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold text-gray-700 uppercase tracking-wide">
                  <AlertTriangle size={14} className="text-red-600" />
                  Emergency Contact
                </label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-gray-900 font-semibold">{userData?.emergencyContact || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status & Information Sidebar */}
        <div className="space-y-6">
          {/* Registration Status */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-50 to-red-50 px-4 py-3 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Shield className="text-orange-600" size={14} />
                </div>
                <h3 className="text-base font-bold text-gray-900">Registration Status</h3>
              </div>
            </div>
            <div className="p-4">
              <div className={`p-3 rounded-lg border ${statusBadge.color}`}>
                <div className="flex items-center space-x-2 mb-2">
                  <StatusIcon size={20} />
                  <span className="font-bold text-sm">{statusBadge.text}</span>
                </div>
                <p className="text-xs">
                  {userData?.isApproved && '✅ You can now apply for bus routes!'}
                  {userData?.isApproved === false && userData?.isRejected === false && 'Your application is under review.'}
                  {!userData?.isApproved && !userData?.isRejected && 'Complete your profile to submit for approval.'}
                </p>
                {userData?.rejectionReason && (
                  <div className="mt-2 p-2 bg-red-100 border border-red-200 rounded-lg">
                    <p className="text-xs font-medium text-red-800">Rejection Reason:</p>
                    <p className="text-xs text-red-700 mt-1">{userData.rejectionReason}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bus Application Status */}
          {userData?.busRegistrationStatus && userData?.busRegistrationStatus !== 'not_registered' && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-4 py-3 border-b border-gray-100">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Award className="text-blue-600" size={14} />
                  </div>
                  <h3 className="text-base font-bold text-gray-900">Bus Application</h3>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-600">Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    userData?.busRegistrationStatus === 'approved' ? 'bg-green-100 text-green-800' :
                    userData?.busRegistrationStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    userData?.busRegistrationStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {userData?.busRegistrationStatus === 'approved' ? '✅ Approved' :
                     userData?.busRegistrationStatus === 'pending' ? '⏳ Pending' :
                     userData?.busRegistrationStatus === 'rejected' ? '❌ Rejected' : 'Not Applied'}
                  </span>
                </div>
                {userData?.applicationDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-600">Applied On</span>
                    <span className="text-xs text-gray-900 font-medium">
                      {new Date(userData.applicationDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {userData?.preferredPickupStop && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-600">Pickup Stop</span>
                    <span className="text-xs text-gray-900 font-medium">{userData.preferredPickupStop}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Account Summary */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-4 py-3 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Users className="text-indigo-600" size={14} />
                </div>
                <h3 className="text-base font-bold text-gray-900">Account Summary</h3>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-600">Email Verified</span>
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                  userData?.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {userData?.isVerified ? '✅ Yes' : '⏳ Pending'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-600">Profile Complete</span>
                <span className="px-2 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                  {userData?.name && userData?.department ? '✅ Yes' : '⚠️ Incomplete'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-600">Member Since</span>
                <span className="text-xs text-gray-900 font-medium">
                  {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Edit Modal */}
      <ProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        userData={userData}
        onSave={handleSaveProfile}
        isLoading={isLoading}
      />
    </div>
  );
};

export default ProfilePage;