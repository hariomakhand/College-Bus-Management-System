import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5001/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setMessage("Password reset link sent to your email!");
        setIsSuccess(true);
      } else {
        setMessage(result.message || "Failed to send reset link");
        setIsSuccess(false);
      }
    } catch (err) {
      setMessage("Something went wrong. Please try again.");
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-gray-100 via-white to-gray-50 flex items-center justify-center p-4 overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200 bg-opacity-30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-indigo-200 bg-opacity-30 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      <motion.div 
        className="relative w-full max-w-sm bg-white bg-opacity-80 backdrop-blur-lg rounded-2xl p-6 border border-gray-200 shadow-2xl"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Forgot <span className="text-blue-600">Password?</span>
          </h2>
          <p className="text-gray-600 text-sm">Enter your email to reset your password</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">Email Address</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-800 placeholder-gray-400 text-sm"
            />
          </div>

          <motion.button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Sending...
              </div>
            ) : (
              "Send Reset Link"
            )}
          </motion.button>
        </form>

        {message && (
          <motion.div 
            className={`mt-4 p-3 rounded-xl text-center text-sm ${
              isSuccess 
                ? "bg-green-100 text-green-800 border border-green-200" 
                : "bg-red-100 text-red-800 border border-red-200"
            }`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {message}
          </motion.div>
        )}

        <div className="mt-4 pt-4 border-t border-gray-200 text-center space-y-2">
          <p className="text-gray-600 text-xs">
            Remember your password?{" "}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign In
            </Link>
          </p>
          <Link to="/" className="text-gray-500 hover:text-gray-700 text-xs flex items-center justify-center space-x-1">
            <span>←</span>
            <span>Back to Home</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}