import { useLogoutMutation } from '../store/apiSlice';
import { useAuth } from '../Context/AuthContext';

export const useLogout = () => {
  const [logoutMutation] = useLogoutMutation();
  const { setUser } = useAuth();

  const logout = async () => {
    console.log("🔄 RTK Logout function called");
    try {
      console.log("📡 Calling backend logout with RTK...");
      await logoutMutation().unwrap();
      console.log("✅ Backend logout successful");
    } catch (err) {
      console.log("❌ Backend logout error:", err);
    }
    
    console.log("🧹 Clearing frontend data...");
    setUser(null);
    localStorage.clear();
    sessionStorage.clear();
    
    document.cookie.split(";").forEach(function(c) { 
      const eqPos = c.indexOf("=");
      const name = eqPos > -1 ? c.substr(0, eqPos).trim() : c.trim();
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    });
    
    console.log("✅ RTK logout complete");
  };

  return logout;
};