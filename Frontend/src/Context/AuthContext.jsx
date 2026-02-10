// AuthContext.js
import { createContext, useContext, useState, useEffect } from "react";
import { initializeSocket, disconnectSocket } from '../services/socket';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/check`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          }
        });
        
        if (res.ok) {
          const data = await res.json();
          if (data.isAuth) {
            setUser(data.user);
            initializeSocket();
          }
        }
      } catch (err) {
        // Silent fail - user not authenticated
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const updateUser = (userData) => {
    setUser(userData);
  };

  const logout = async () => {
    console.log("🔄 Logout function called");
    try {
      console.log("📡 Calling backend logout...");
      await fetch(`${import.meta.env.VITE_API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        }
      });
      console.log("✅ Backend logout successful");
    } catch (err) {
      console.log("❌ Backend logout error (continuing with frontend cleanup):", err);
    }
    
    console.log("🧹 Clearing frontend data...");
    disconnectSocket();
    setUser(null);
    localStorage.clear();
    sessionStorage.clear();
    
    document.cookie.split(";").forEach(function(c) { 
      const eqPos = c.indexOf("=");
      const name = eqPos > -1 ? c.substr(0, eqPos).trim() : c.trim();
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    });
    
    console.log("✅ Complete logout finished");
  };

  return (
    <AuthContext.Provider value={{ user, setUser: updateUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
