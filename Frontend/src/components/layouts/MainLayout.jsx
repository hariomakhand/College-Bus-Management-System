// components/layouts/MainLayout.jsx
import { Outlet, Link } from "react-router-dom";

export default function MainLayout() {
  return (
    <div>
      <nav>
        <Link to="/">Home</Link> | <Link to="/dashboard">Dashboard</Link> | <Link to="/admin">Admin</Link>
      </nav>
      

      <hr />
      <Outlet /> {/* Nested pages render here */}
    </div>
  );
}
