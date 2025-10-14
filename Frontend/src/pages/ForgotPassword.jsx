// src/pages/ForgotPassword.jsx
import { useState } from "react";
import { API } from "../Api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/forgot-password", { email });
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "400px" }}>
      <h3 className="text-center mb-3">Forgot Password</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Enter your email"
          className="form-control mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button className="btn btn-primary w-100">Send Reset Link</button>
      </form>
      {message && <p className="text-center mt-3">{message}</p>}
    </div>
  );
}
