import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { API } from "../Api";
import { useAuth } from "../Context/AuthContext";

export default function VerifyEmail() {
  const [otp, setOtp] = useState("");
    const { setUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email; // email from signup

  const handleSubmit = async e => {
    e.preventDefault();
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
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Enter OTP sent to {email}</h3>
      <input
        placeholder="6-digit OTP"
        value={otp}
        onChange={e => setOtp(e.target.value)}
        required
      />
      <button type="submit">Verify Email</button>
    </form>
  );
}
