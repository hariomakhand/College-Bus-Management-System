import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { useLoginMutation } from "../store/apiSlice";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [login, { isLoading }] = useLoginMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await login({ email, password }).unwrap();
      alert(`Login successful as ${result.user.role} ✅`);
      setUser(result.user);
      switch (result.user.role.toLowerCase()) {
        case "admin": navigate("/admin"); break;
        case "driver": navigate("/driver-dashboard"); break;
        case "student": navigate("/student-dashboard"); break;
        default: navigate("/");
      }
    } catch (err) {
      alert(err.data?.message || "Login failed ❌");
      setEmail(""); setPassword("");
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
            Welcome <span className="text-blue-600">Back</span>
          </h2>
          <p className="text-gray-600 text-sm">Sign in to your Smart Bus account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-800 placeholder-gray-400 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-3 pr-10 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-800 placeholder-gray-400 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="text-center">
            <Link to="/forgot-password" className="text-blue-600 hover:text-blue-700 text-xs">
              Forgot Password?
            </Link>
          </div>

          <motion.button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Sign In
          </motion.button>
        </form>

        <div className="mt-4 pt-4 border-t border-gray-200 text-center space-y-2">
          <p className="text-gray-600 text-xs">
            Don't have an account?{" "}
            <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-medium">
              Create Account
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