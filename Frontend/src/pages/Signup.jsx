import React, { useState } from "react";

import { useNavigate } from "react-router-dom"; // Navigate hook ka use karenge
import { API } from "../Api";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log({ name, email, password });


    try {

      const res = await API.post(
        "/signup",
        { name, email, password},
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }

      );

      alert(res.data.message);

      if (res.data.success) {
        setName("");
        setEmail("");
        setPassword("");

        // ✅ Redirect to OTP verify page with email state
        navigate("/verify-email", { state: { email } });
      }

    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Signup failed");
      setName("");
      setEmail("");
      setPassword("");
    }

  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card shadow-lg p-4" style={{ width: "400px" }}>
        <h2 className="text-center mb-4">Sign Up</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Email address</label>
            <input
              type="email"
              className="form-control"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        

          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-100">
            Sign Up
          </button>
        </form>
        <p className="text-center mt-3">
          Already have an account?{" "}
          <a href="/login" className="text-decoration-none">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}
