import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { API } from "../Api";
import { useAuth } from "../Context/AuthContext";

export default function VerifyEmail() {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { setUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email; // email from signup

  const handleSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await API.post("/verify-email", { email, otp });
      if (res.data.success) {
        alert("Email verified successfully!");
        setUser(res.data.user);
        if(res.data.user.role.toLowerCase()==='student'){
          navigate("/student-dashboard");
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || "Verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-black px-4 overflow-hidden">
      <div className="w-full max-w-md bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-gray-200 transform hover:scale-105 transition-all duration-300 animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-gray-800 to-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center animate-bounce-slow">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-black mb-2 animate-slide-up">
            Verify Email
          </h2>
          <p className="text-gray-600 animate-slide-up delay-100">
            Enter the OTP sent to
          </p>
          <p className="text-blue-600 font-semibold animate-slide-up delay-150">
            {email}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 animate-slide-up delay-200">
          <div>
            <label className="block text-black font-semibold mb-2">
              6-Digit OTP
            </label>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={e => setOtp(e.target.value)}
              required
              maxLength="6"
              className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all duration-300 hover:border-gray-400 text-center text-2xl font-mono tracking-widest"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-gray-800 to-blue-600 hover:from-gray-900 hover:to-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Verifying...
              </div>
            ) : (
              "Verify Email"
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200 animate-slide-up delay-300">
          <p className="text-center text-gray-600 mb-4">
            Didn't receive the code?
          </p>
          <div className="flex justify-center space-x-4">
            <button className="text-blue-600 hover:text-blue-800 font-semibold transition duration-200">
              Resend OTP
            </button>
            <span className="text-gray-400">|</span>
            <Link
              to="/login"
              className="text-blue-600 hover:text-blue-800 font-semibold transition duration-200"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-fade-in { animation: fade-in 0.6s ease-out; }
        .animate-slide-up { animation: slide-up 0.6s ease-out; }
        .animate-bounce-slow { animation: bounce-slow 2s infinite; }
        .delay-100 { animation-delay: 0.1s; }
        .delay-150 { animation-delay: 0.15s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
      `}</style>
    </div>
  );
}