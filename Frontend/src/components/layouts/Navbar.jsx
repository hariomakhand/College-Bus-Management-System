import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import { useLogout } from "../../hooks/useLogout";
import busLogo from "../../assets/Buslogo.jpg";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { user } = useAuth();
  const logout = useLogout();
  const navigate = useNavigate();

  const getDashboardRoute = () => {
    switch(user?.role) {
      case 'admin': return '/admin';
      case 'driver': return '/driver';
      case 'student': return '/student';
      default: return '/dashboard';
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${scrolled
        ? 'bg-white bg-opacity-95 backdrop-blur-lg shadow-2xl border-b border-blue-100'
        : 'bg-transparent'
      }`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Unique Logo Design */}
          <div className="flex items-center ">
            <div className="relative">

              <img
                src={busLogo}
                alt="Bus Logo"
                className="w-32 h-32 object-contain"
              />
            </div>
            <div className="hidden md:block">
              <h1 className={`text-2xl font-bold tracking-tight transition-colors duration-300 ${scrolled ? 'text-gray-900' : 'text-white'
                }`}>
                Smart<span className="text-blue-500">Bus</span>
              </h1>
              <p className={`text-xs font-medium transition-colors duration-300 ${scrolled ? 'text-gray-500' : 'text-blue-200'
                }`}>Management System</p>
            </div>
          </div>

          {/* Unique Navigation Pills */}
          <div className="hidden md:flex items-center">
            <div className={`flex items-center space-x-2 p-2 rounded-2xl transition-all duration-300 ${scrolled ? 'bg-gray-100' : 'bg-white bg-opacity-20 backdrop-blur-sm'
              }`}>
              {['Home', 'About', 'Services', 'Contact'].map((item, index) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  onClick={(e) => {
                    e.preventDefault();
                    const targetId = item.toLowerCase() === 'home' ? 'home' : item.toLowerCase();
                    const element = document.getElementById(targetId) || document.querySelector('section');
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                  className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-105 ${scrolled
                      ? 'text-gray-700 hover:bg-blue-500 hover:text-white hover:shadow-lg'
                      : 'text-white hover:bg-white hover:text-blue-600 hover:shadow-xl'
                    }`}
                >
                  {item}
                </a>
              ))}
            </div>
          </div>

          {/* Auth Buttons / User Info */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105 ${scrolled ? 'bg-gray-100 hover:bg-gray-200' : 'bg-white bg-opacity-20 backdrop-blur-sm hover:bg-opacity-30'
                  }`}
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-400 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className={`font-semibold text-sm ${scrolled ? 'text-gray-700' : 'text-white'
                      }`}>
                      {user.name}
                    </div>
                    <div className={`text-xs ${scrolled ? 'text-gray-500' : 'text-blue-200'
                      }`}>
                      {user.role || 'User'}
                    </div>
                  </div>
                  <svg className={`w-4 h-4 transition-transform ${userDropdownOpen ? 'rotate-180' : ''} ${scrolled ? 'text-gray-700' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
                    <button
                      onClick={() => {
                        navigate(getDashboardRoute());
                        setUserDropdownOpen(false);
                      }}
                      className="w-full px-4 py-3 text-left text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
                      </svg>
                      <span>Dashboard</span>
                    </button>
                    <button
                      onClick={async () => {
                        await logout();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full px-4 py-3 text-left text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors flex items-center space-x-2 border-t border-gray-100"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 ${scrolled
                      ? 'text-gray-700 hover:bg-gray-100'
                      : 'text-white hover:bg-white hover:bg-opacity-20'
                    }`}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="relative px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 hover:-translate-y-1"
                >
                  <span className="relative z-10">Get Started</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
              </>
            )}
          </div>

          {/* Unique Mobile Menu Button */}
          <button
            className={`md:hidden p-3 rounded-xl transition-all duration-300 ${scrolled
                ? 'text-gray-700 hover:bg-gray-100'
                : 'text-white hover:bg-white hover:bg-opacity-20'
              }`}
            onClick={() => setOpen(!open)}
          >
            <div className="relative w-6 h-6">
              <span className={`absolute block w-6 h-0.5 bg-current transform transition-all duration-300 ${open ? 'rotate-45 top-3' : 'top-1'
                }`}></span>
              <span className={`absolute block w-6 h-0.5 bg-current top-3 transition-all duration-300 ${open ? 'opacity-0' : 'opacity-100'
                }`}></span>
              <span className={`absolute block w-6 h-0.5 bg-current transform transition-all duration-300 ${open ? '-rotate-45 top-3' : 'top-5'
                }`}></span>
            </div>
          </button>

        </div>
      </div>

      {/* Unique Mobile Menu */}
      <div className={`md:hidden overflow-hidden transition-all duration-500 ${open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}>
        <div className="bg-white bg-opacity-95 backdrop-blur-lg border-t border-blue-100 shadow-2xl">
          <div className="px-6 py-6 space-y-2">
            {['Home', 'About', 'Services', 'Contact'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                onClick={(e) => {
                  e.preventDefault();
                  const targetId = item.toLowerCase() === 'home' ? 'home' : item.toLowerCase();
                  const element = document.getElementById(targetId) || document.querySelector('section');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                  setOpen(false);
                }}
                className="block px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 font-semibold rounded-xl transition-all duration-300 transform hover:translate-x-2"
              >
                {item}
              </a>
            ))}
            <div className="pt-4 border-t border-gray-200 space-y-3">
              {user ? (
                <>
                  <div className="flex items-center space-x-2 px-4 py-3 bg-gray-100 rounded-xl">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-400 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-700 text-sm">{user.name}</div>
                      <div className="text-xs text-gray-500">{user.role || 'User'}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      navigate(getDashboardRoute());
                      setOpen(false);
                    }}
                    className="block w-full px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 font-semibold rounded-xl transition-all duration-300 text-center"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={async () => {
                      await logout();
                      setOpen(false);
                    }}
                    className="block w-full px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 font-semibold rounded-xl transition-all duration-300 text-center"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/auth"
                    className="block w-full px-4 py-3 text-gray-700 hover:bg-gray-100 font-semibold rounded-xl transition-all duration-300 text-center"
                    onClick={() => setOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/auth"
                    className="block w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg text-center font-semibold"
                    onClick={() => setOpen(false)}
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;