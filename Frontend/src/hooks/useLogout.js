import { useLogoutMutation } from '../store/apiSlice';
import { useAuth } from '../Context/AuthContext';
import { toast } from 'react-toastify';

export const useLogout = () => {
  const [logoutMutation] = useLogoutMutation();
  const { setUser } = useAuth();

  const logout = async () => {
    try {
      await logoutMutation().unwrap();
      toast.success("Logged out successfully!");
    } catch (err) {
      toast.error("Logout failed!");
    }
    
    setUser(null);
    localStorage.clear();
    sessionStorage.clear();
    
    document.cookie.split(";").forEach(function(c) { 
      const eqPos = c.indexOf("=");
      const name = eqPos > -1 ? c.substr(0, eqPos).trim() : c.trim();
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    });
  };

  return logout;
};