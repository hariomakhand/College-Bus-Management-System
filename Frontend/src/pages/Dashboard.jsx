import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../Context/AuthContext";
import { API } from "../Api";

export default function Dashboard() {
  const { user, setUser } = useAuth(); // 👈 ab user bhi liya
  const navigate = useNavigate();

  const handlerClick = async (e) => {
    e.preventDefault();
    try {
      const res = await API("/logout", {
        withCredentials: true,
      });

      if (res.data.success) {
        setUser(null); // global user reset
        alert("You have logged out");
        navigate("/");
      } else {
        alert("User already logged out");
      }
    } catch (err) {
      console.log(err);
      alert("User already logged out");
    }
  };

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
        <div className="container-fluid">
          <Link className="navbar-brand fw-bold" to="/">
            MyApp
          </Link>

          <div className="d-flex ms-auto gap-2">
            {!user ? (
              <>
                <Link to="/login" className="btn btn-primary">
                  Login
                </Link>
                <Link to="/signup" className="btn btn-success">
                  Sign Up
                </Link>
              </>
            ) : (
              <button onClick={handlerClick} className="btn btn-danger">
                Logout
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Body Content */}
      <div className="container text-center mt-5">
        <div className="card shadow-lg p-4">
          {user ? (
            <>
              <h1 className="mb-3">Welcome, {user.name} 🎉</h1>
              <p className="text-muted">
                You are logged in with <strong>{user.email}</strong>.
              </p>
            </>
          ) : (
            <>
              <h1 className="mb-3">Welcome to My App 👋</h1>
              <p className="text-muted">
                Please <Link to="/login">Login</Link> or{" "}
                <Link to="/signup">Sign Up</Link> to continue.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
