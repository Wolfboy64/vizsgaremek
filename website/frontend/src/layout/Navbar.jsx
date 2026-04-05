import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Navbar.css";

const getInitials = (name) => {
  const normalized = String(name || "").trim();
  if (!normalized) return "U";

  const parts = normalized.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const profileMenuRef = useRef(null);

  const isHome = location.pathname === "/";
  const isProducts = location.pathname.startsWith("/termekek");
  const isContact = location.pathname === "/kapcsolat";

  const userInitials = useMemo(() => getInitials(user?.nev), [user?.nev]);
  const avatarUrl = useMemo(() => {
    const value = String(user?.avatarUrl || "").trim();
    return value || null;
  }, [user?.avatarUrl]);
  const showAvatarImage = Boolean(avatarUrl) && !avatarLoadFailed;

  const profileDisplayName = useMemo(() => {
    const value = String(user?.nev || "").trim();
    if (!value) return "Felhasználó";
    return value.length > 20 ? `${value.slice(0, 20)}...` : value;
  }, [user?.nev]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!profileMenuRef.current?.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const closeMenu = () => setIsOpen(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsOpen(false);
    setIsProfileMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-left">
          <Link to="/" onClick={closeMenu} className={isHome ? "nav-active" : ""}>
            Főoldal
          </Link>
          <Link
            to="/termekek"
            onClick={closeMenu}
            className={isProducts ? "nav-active" : ""}
          >
            Termékek
          </Link>
        </div>

        <Link to="/" className="nav-logo" onClick={closeMenu}>
          <span className="logo-cyber">Cyber</span>
          <span className="logo-nest">Nest</span>
        </Link>

        <div className="nav-right">
          <Link
            to="/kapcsolat"
            onClick={closeMenu}
            className={isContact ? "nav-active" : ""}
          >
            Kapcsolat
          </Link>

          {isAuthenticated() ? (
            <div className="profile-menu-wrap" ref={profileMenuRef}>
              <button
                type="button"
                className={`profile-trigger ${isProfileMenuOpen ? "open" : ""}`}
                aria-haspopup="menu"
                aria-expanded={isProfileMenuOpen}
                onClick={() => setIsProfileMenuOpen((prev) => !prev)}
              >
                <span className="profile-avatar">
                  {showAvatarImage ? (
                    <img
                      src={avatarUrl}
                      alt={profileDisplayName}
                      referrerPolicy="no-referrer"
                      onError={() => setAvatarLoadFailed(true)}
                    />
                  ) : (
                    userInitials
                  )}
                </span>
                <span className="profile-trigger-meta">
                  <span className="profile-trigger-name">{profileDisplayName}</span>
                </span>
              </button>

              {isProfileMenuOpen && (
                <div className="profile-menu" role="menu">
                  <div className="profile-menu-header">
                    <div className="profile-menu-top">
                      <span className="profile-menu-avatar">
                        {showAvatarImage ? (
                          <img
                            src={avatarUrl}
                            alt={profileDisplayName}
                            referrerPolicy="no-referrer"
                            onError={() => setAvatarLoadFailed(true)}
                          />
                        ) : (
                          userInitials
                        )}
                      </span>
                      <div className="profile-menu-id">
                        <div className="profile-menu-name">{user?.nev || "Felhasználó"}</div>
                        <div className="profile-menu-email">{user?.elerhetoseg}</div>
                      </div>
                    </div>
                    <div className="profile-menu-role">
                      {user?.role === "admin" ? "Adminisztrátor" : "Felhasználó"}
                    </div>
                  </div>

                  <div className="profile-menu-actions">
                    <Link
                      to="/ugyfelportal/profil"
                      className="profile-menu-link"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      Profil
                    </Link>
                    <Link
                      to="/ugyfelportal/dashboard"
                      className="profile-menu-link"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      Foglalásaim
                    </Link>
                    <button
                      type="button"
                      className="profile-menu-logout"
                      onClick={handleLogout}
                    >
                      Kijelentkezés
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link to="/ugyfelportal/login" className="nav-login-btn" onClick={closeMenu}>
              Bejelentkezés
            </Link>
          )}
        </div>

        <div className={`hamburger ${isOpen ? "active" : ""}`} onClick={() => setIsOpen((prev) => !prev)}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      <div className={`mobile-menu ${isOpen ? "active" : ""}`}>
        <Link to="/" onClick={closeMenu} className={isHome ? "nav-active" : ""}>
          Főoldal
        </Link>
        <Link to="/termekek" onClick={closeMenu} className={isProducts ? "nav-active" : ""}>
          Termékek
        </Link>
        <Link to="/kapcsolat" onClick={closeMenu} className={isContact ? "nav-active" : ""}>
          Kapcsolat
        </Link>

        {isAuthenticated() ? (
          <>
            <div className="mobile-profile-meta">
              <strong>{user?.nev}</strong>
              <span>{user?.elerhetoseg}</span>
            </div>
            <Link to="/ugyfelportal/profil" onClick={closeMenu}>
              Profil
            </Link>
            <Link to="/ugyfelportal/dashboard" onClick={closeMenu}>
              Dashboard
            </Link>
            <button onClick={handleLogout} className="mobile-logout-btn">
              Kijelentkezés
            </button>
          </>
        ) : (
          <Link to="/ugyfelportal/login" onClick={closeMenu}>
            Bejelentkezés
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
