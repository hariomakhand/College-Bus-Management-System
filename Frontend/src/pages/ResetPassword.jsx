// src/pages/ResetPassword.jsx
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API } from "../Api";

export default function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage("Passwords do not match!");
      return;
    }

    try {
      const res = await API.post(`/reset-password/${token}`, { password });
      setMessage(res.data.message);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setMessage(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "400px" }}>
      <h3 className="text-center mb-3">Reset Password</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="New Password"
          className="form-control mb-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirm Password"
          className="form-control mb-3"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button className="btn btn-success w-100">Reset Password</button>
      </form>
      {message && <p className="text-center mt-3">{message}</p>}
    </div>
  );
}
