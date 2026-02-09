import React from 'react';
import { LogOut, X } from 'lucide-react';

const Sidebar = ({ 
  isOpen, 
  onClose, 
  tabs, 
  activeTab, 
  onTabChange, 
  user, 
  onLogout, 
  title, 
  subtitle,
  bgColor = "bg-gray-800",
  accentColor = "bg-yellow-500"
}) => {
  return (
    <div className={`w-64 ${bgColor} shadow-lg border-r border-gray-700 fixed h-full z-30 transform transition-transform duration-300 ease-in-out ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    } lg:translate-x-0`}>
      {/* Logo */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 ${accentColor} rounded-xl flex items-center justify-center`}>
              <span className="text-gray-900 text-lg font-bold">🚌</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">{title}</h1>
              <p className="text-xs text-gray-400">{subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                onTabChange(tab.id);
                onClose();
              }}
              className={`w-full flex items-center space-x-3 px-6 py-3 text-left transition-all ${
                activeTab === tab.id
                  ? `${accentColor} text-gray-900 border-r-4 border-yellow-400 shadow-lg font-semibold`
                  : "text-gray-300 hover:bg-gray-700 hover:text-yellow-400"
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{tab.name}</span>
            </button>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="absolute bottom-6 left-6 right-6">
        {user && (
          <div className="mb-3 p-3 bg-gray-700 rounded-lg border border-gray-600">
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 ${accentColor} rounded-full flex items-center justify-center overflow-hidden`}>
                {user.profileImage?.url ? (
                  <img src={user.profileImage.url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-gray-900 text-sm font-semibold">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.name || 'User'}</p>
                <p className="text-xs text-gray-400 truncate">{user.email || ''}</p>
              </div>
            </div>
          </div>
        )}
        
        <button
          onClick={onLogout}
          className={`w-full flex items-center justify-center space-x-3 px-4 py-3 ${accentColor} text-gray-900 rounded-lg hover:bg-yellow-600 transition-colors shadow-lg font-semibold`}
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
