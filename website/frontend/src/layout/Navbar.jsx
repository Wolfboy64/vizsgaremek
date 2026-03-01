import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Navbar.css";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsOpen(false);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-left">
          <Link to="/" onClick={closeMenu}>
            Főoldal
          </Link>
          <Link to="/termekek" onClick={closeMenu}>
            Termékek
          </Link>
        </div>

        <Link to="/" className="nav-logo" onClick={closeMenu}>
          <span className="logo-cyber">Cyber</span>
          <span className="logo-nest">Nest</span>
        </Link>

        <div className="nav-right">
          <Link to="/kapcsolat" onClick={closeMenu}>
            Kapcsolat
          </Link>
          {isAuthenticated() ? (
            <>
              <Link to="/ugyfelportal/dashboard" onClick={closeMenu}>
                Dashboard
              </Link>
              <button onClick={handleLogout} className="nav-logout-btn">
                Kijelentkezés
              </button>
            </>
          ) : (
            <Link to="/ugyfelportal/login" onClick={closeMenu}>
              Ügyfélportál
            </Link>
          )}
        </div>

        <div
          className={`hamburger ${isOpen ? "active" : ""}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      <div className={`mobile-menu ${isOpen ? "active" : ""}`}>
        <Link to="/" onClick={closeMenu}>
          Főoldal
        </Link>
        <Link to="/termekek" onClick={closeMenu}>
          Termékek
        </Link>
        <Link to="/kapcsolat" onClick={closeMenu}>
          Kapcsolat
        </Link>
        {isAuthenticated() ? (
          <>
            <Link to="/ugyfelportal/dashboard" onClick={closeMenu}>
              Dashboard ({user?.nev})
            </Link>
            <button onClick={handleLogout} className="mobile-logout-btn">
              Kijelentkezés
            </button>
          </>
        ) : (
          <Link to="/ugyfelportal/login" onClick={closeMenu}>
            Ügyfélportál
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
