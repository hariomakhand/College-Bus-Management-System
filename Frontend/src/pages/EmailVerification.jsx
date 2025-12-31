import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

export default function EmailVerification() {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();
  const email = location.state?.email;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:5001/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, otp })
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert("Email verified successfully! ✅");
        setUser(result.user);
        
        // Navigate based on role
        switch (result.user.role.toLowerCase()) {
          case "admin": navigate("/admin"); break;
          case "driver": navigate("/driver-dashboard"); break;
          case "student": navigate("/student-dashboard"); break;
          default: navigate("/");
        }
      } else {
        alert(result.message || "Verification failed ❌");
      }
    } catch (err) {
      alert("Verification failed ❌");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-blue-500 via-blue-600 to-blue-500 flex items-center justify-center p-4">
      <motion.div 
        className="w-full max-w-sm bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 border border-white border-opacity-20 shadow-2xl"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-gradient-to-r from-green-400 to-blue-500 rounded-2xl mx-auto mb-4 flex items-center justify-center text-2xl">
            📧
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Verify Email</h2>
          <p className="text-gray-200 text-sm">Enter the OTP sent to {email}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-200 mb-2">OTP Code</label>
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength="6"
              required
              className="w-full px-3 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-xl focus:ring-2 focus:ring-green-400 outline-none text-white placeholder-gray-300 text-sm text-center tracking-widest"
            />
          </div>

          <motion.button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-green-400 to-blue-500 text-white font-bold py-3 rounded-xl shadow-2xl disabled:opacity-50"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? "Verifying..." : "Verify Email ✨"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}