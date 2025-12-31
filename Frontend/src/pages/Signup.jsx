import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { useSignupMutation } from "../store/apiSlice";
import { Eye, EyeOff } from "lucide-react";

export default function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear errors when user starts typing
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const [signup, { isLoading }] = useSignupMutation();

  const validateForm = () => {
    const newErrors = {};
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    if (formData.password.length < 4) {
      newErrors.password = "Password must be at least 4 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      // Only send required fields to backend
      const { confirmPassword, ...signupData } = formData;
      await signup(signupData).unwrap();
      alert("Signup successful! Please verify your email ✅");
      navigate("/verify-email", { state: { email: formData.email } });
    } catch (err) {
      alert(err.data?.message || "Signup failed ❌");
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-gray-100 via-white to-gray-50 flex items-center justify-center p-4 overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-green-200 bg-opacity-30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-blue-200 bg-opacity-30 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      <motion.div 
        className="relative w-full max-w-sm bg-white bg-opacity-80 backdrop-blur-lg rounded-2xl p-5 border border-gray-200 shadow-2xl"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold text-gray-800 mb-1">
            Join <span className="text-blue-600">Smart Bus</span>
          </h2>
          <p className="text-gray-600 text-xs">Create your account today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-800 placeholder-gray-400 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-800 placeholder-gray-400 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Create password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className={`w-full px-3 py-2.5 pr-10 bg-white border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-800 placeholder-gray-400 text-sm ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                className={`w-full px-3 py-2.5 pr-10 bg-white border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-800 placeholder-gray-400 text-sm ${
                  errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          <motion.button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Create Account
          </motion.button>
        </form>

        <div className="mt-3 pt-3 border-t border-gray-200 text-center space-y-1">
          <p className="text-gray-600 text-xs">
            Already have an account?{" "}
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