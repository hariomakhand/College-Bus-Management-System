import { useLoginMutation, useStudentLoginMutation } from '../store/apiSlice';
import { useAuth } from '../Context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const QuickLogin = () => {
  const [login, { isLoading }] = useLoginMutation();
  const [studentLogin, { isLoading: studentLoading }] = useStudentLoginMutation();
  const { login: authLogin } = useAuth();
  const navigate = useNavigate();
  const [showOptions, setShowOptions] = useState(false);

  const handleAdminLogin = async () => {
    try {
      const result = await login({
        email: 'admin@test.com',
        password: 'admin123',
        role: 'admin'
      }).unwrap();
      
      authLogin(result.user);
      navigate('/admin');
    } catch (err) {
      alert('Admin login failed: ' + (err.data?.message || err.message));
    }
  };

  const handleStudentLogin = () => {
    navigate('/student-auth');
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setShowOptions(!showOptions)}
        className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200 font-semibold"
      >
        Quick Access
      </button>
      
      {showOptions && (
        <div className="absolute top-full mt-2 bg-white rounded-xl shadow-xl border border-gray-200 min-w-48 z-10">
          <button
            onClick={handleAdminLogin}
            disabled={isLoading}
            className="w-full px-4 py-3 text-left hover:bg-gray-50 rounded-t-xl transition-colors"
          >
            {isLoading ? 'Logging in...' : '👨‍💼 Admin Login'}
          </button>
          <button
            onClick={handleStudentLogin}
            className="w-full px-4 py-3 text-left hover:bg-gray-50 rounded-b-xl transition-colors border-t border-gray-100"
          >
            🎓 Student Portal
          </button>
        </div>
      )}
    </div>
  );
};

export default QuickLogin;