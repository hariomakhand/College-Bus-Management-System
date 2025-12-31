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
      await onUpdateProfile(formData);
      setShowEditModal(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl shadow-2xl p-8 text-white mb-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-10"></div>
          <div className="relative z-10 flex justify-between items-center">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-white bg-opacity-20 backdrop-blur-sm rounded-3xl flex items-center justify-center border-2 border-white border-opacity-30 shadow-xl">
                <User className="text-white" size={48} />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">{userData?.name || 'Student Name'}</h1>
                <p className="text-blue-100 text-lg mb-1">{userData?.email}</p>
                <p className="text-blue-200 text-sm">Student ID: {userData?.studentId || 'Not assigned'}</p>
              </div>
            </div>
            <button
              onClick={() => setShowEditModal(true)}
              className="flex items-center gap-3 px-8 py-4 bg-white bg-opacity-20 backdrop-blur-sm text-white rounded-2xl hover:bg-opacity-30 transition-all duration-300 border border-white border-opacity-30 shadow-lg group"
            >
              <Edit3 size={20} className="group-hover:rotate-12 transition-transform" />
              <span className="font-semibold">Edit Profile</span>
            </button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Personal Information - Takes 2 columns */}
          <div className="xl:col-span-2 space-y-8">
            {/* Basic Information Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <User className="text-blue-600" size={20} />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
                </div>
              </div>
              
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Full Name */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-wide">
                      <User size={16} className="text-blue-600" />
                      Full Name
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border-2 border-gray-100">
                      <p className="text-gray-900 font-semibold text-lg">{userData?.name || 'Not provided'}</p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-wide">
                      <Mail size={16} className="text-blue-600" />
                      Email Address
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border-2 border-gray-100">
                      <p className="text-gray-900 font-semibold">{userData?.email || 'Not provided'}</p>
                      <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                        <CheckCircle size={12} />
                        Verified
                      </p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-wide">
                      <Phone size={16} className="text-blue-600" />
                      Phone Number
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border-2 border-gray-100">
                      <p className="text-gray-900 font-semibold">{userData?.phone || 'Not provided'}</p>
                    </div>
                  </div>

                  {/* Student ID */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-wide">
                      <CreditCard size={16} className="text-blue-600" />
                      Student ID
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border-2 border-gray-100">
                      <p className="text-gray-900 font-mono font-bold text-lg">{userData?.studentId || 'Not assigned'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Academic Information Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-8 py-6 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <BookOpen className="text-purple-600" size={20} />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Academic Information</h2>
                </div>
              </div>
              
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Department */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-wide">
                      <Settings size={16} className="text-purple-600" />
                      Department
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border-2 border-gray-100">
                      <p className="text-gray-900 font-semibold text-lg">{userData?.department || 'Not specified'}</p>
                    </div>
                  </div>

                  {/* Academic Year */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-wide">
                      <Calendar size={16} className="text-purple-600" />
                      Academic Year
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border-2 border-gray-100">
                      <p className="text-gray-900 font-semibold text-lg">{userData?.year || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-8 py-6 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <MapPin className="text-green-600" size={20} />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Contact Information</h2>
                </div>
              </div>
              
              <div className="p-8 space-y-8">
                {/* Address */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-wide">
                    <Home size={16} className="text-green-600" />
                    Home Address
                  </label>
                  <div className="p-4 bg-gray-50 rounded-xl border-2 border-gray-100">
                    <p className="text-gray-900 font-medium leading-relaxed">{userData?.address || 'Not provided'}</p>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-wide">
                    <AlertTriangle size={16} className="text-red-600" />
                    Emergency Contact
                  </label>
                  <div className="p-4 bg-gray-50 rounded-xl border-2 border-gray-100">
                    <p className="text-gray-900 font-semibold">{userData?.emergencyContact || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Status & Information Sidebar */}
          <div className="space-y-8">
            {/* Registration Status */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-orange-50 to-red-50 px-6 py-4 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Shield className="text-orange-600" size={16} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Registration Status</h3>
                </div>
              </div>
              <div className="p-6">
                <div className={`p-4 rounded-xl border-2 ${statusBadge.color}`}>
                  <div className="flex items-center space-x-3 mb-3">
                    <StatusIcon size={24} />
                    <span className="font-bold text-lg">{statusBadge.text}</span>
                  </div>
                  <p className="text-sm">
                    {userData?.isApproved && '✅ You can now apply for bus routes!'}
                    {userData?.isApproved === false && userData?.isRejected === false && 'Your application is under review.'}
                    {!userData?.isApproved && !userData?.isRejected && 'Complete your profile to submit for approval.'}
                  </p>
                  {userData?.rejectionReason && (
                    <div className="mt-3 p-3 bg-red-100 border border-red-200 rounded-lg">
                      <p className="text-sm font-medium text-red-800">Rejection Reason:</p>
                      <p className="text-sm text-red-700 mt-1">{userData.rejectionReason}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bus Application Status */}
            {userData?.busRegistrationStatus && userData?.busRegistrationStatus !== 'not_registered' && (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Award className="text-blue-600" size={16} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Bus Application</h3>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Status</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${
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
                      <span className="text-sm font-medium text-gray-600">Applied On</span>
                      <span className="text-sm text-gray-900 font-medium">
                        {new Date(userData.applicationDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {userData?.preferredPickupStop && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Pickup Stop</span>
                      <span className="text-sm text-gray-900 font-medium">{userData.preferredPickupStop}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Account Summary */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Users className="text-indigo-600" size={16} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Account Summary</h3>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Email Verified</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    userData?.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {userData?.isVerified ? '✅ Yes' : '⏳ Pending'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Profile Complete</span>
                  <span className="px-2 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                    {userData?.name && userData?.department ? '✅ Yes' : '⚠️ Incomplete'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Member Since</span>
                  <span className="text-sm text-gray-900 font-medium">
                    {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
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