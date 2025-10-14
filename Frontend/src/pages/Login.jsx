// pages/Login.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import { useAuth } from "../Context/AuthContext";
import { API } from "../Api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student"); // default role
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const res = await API.post(
        "/login",
        { email, password, role },
        { withCredentials: true }
      );

      if (res.data.success) {
        alert(`Login successful as ${res.data.user.role} ✅`);
        setUser(res.data.user);

        // Role-based redirect
        switch (res.data.user.role.toLowerCase()) {
          case "admin":
            navigate("/admin-dashboard");
            break;
          case "driver":
            navigate("/driver-dashboard");
            break;
          case "student":
            navigate("/student-dashboard");
            break;
          default:
            navigate("/Dashboard");
        }
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      console.log(err.message);
      alert(err.response?.data?.message || "Email or password wrong ❌");
      setEmail("");
      setPassword("");
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card shadow-lg p-4" style={{ width: "400px" }}>
        <h2 className="text-center mb-4">Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Email address</label>
            <input
              type="email"
              className="form-control"
              placeholder="Enter your email"
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
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Role</label>
            <select
              className="form-select"
              
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="student">Student</option>
              <option value="driver">Driver</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="text-center mb-2">
            <Link to="/forgot-password">Forgot Password?</Link>
          </div>

          <button type="submit" className="btn btn-primary w-100">
            Login
          </button>
        </form>
        <p className="text-center mt-3">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-decoration-none">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
