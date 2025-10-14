// pages/NotFound.jsx
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div style={{
      textAlign: "center",
      marginTop: "100px",
      fontFamily: "Arial, sans-serif"
    }}>
      <h1 style={{ fontSize: "72px", marginBottom: "20px" }}>404</h1>
      <h2 style={{ marginBottom: "20px" }}>Page Not Found</h2>
      <p style={{ marginBottom: "30px" }}>
        The page you are looking for does not exist or has been moved.
      </p>
      <Link to="/" style={{
        textDecoration: "none",
        color: "#fff",
        backgroundColor: "#007bff",
        padding: "10px 20px",
        borderRadius: "5px"
      }}>
        Go to Home
      </Link>
    </div>
  );
}
