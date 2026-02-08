import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import "../styles/Navbar.css";

const Navbar = () => {
  const { user } = useAuth();

  return (
    <nav className="navbar">
      <div className="nav-left">
        <NavLink
          to="/"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Home
        </NavLink>

        <NavLink
          to="/about"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          About
        </NavLink>

        <NavLink
          to="/contact"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Contact
        </NavLink>
      </div>

      <div className="nav-center">
        CyberNest
      </div>

      <div className="nav-right">
        <NavLink
          to="/dashboard"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Dashboard
        </NavLink>

        {user ? (
          <NavLink to="/profile">Profile</NavLink>
        ) : (
          <>
            <NavLink to="/login">Login</NavLink>
            <NavLink to="/register">Register</NavLink>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
