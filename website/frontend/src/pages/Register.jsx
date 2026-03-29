import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../services/api";
import "../styles/Auth.css";
import googleIcon from "../assets/icons/google-color-icon.svg";
import githubIcon from "../assets/icons/github-white-icon.svg";
import {
  isValidEmail,
  isValidPassword,
  isValidUsername,
} from "../utils/validation";

const MotionDiv = motion.div;
const MotionButton = motion.button;
const apiBase = (import.meta.env.VITE_API_BASE_URL || "/api").replace(
  /\/$/,
  "",
);

const Register = () => {
  const [formData, setFormData] = useState({
    nev: "",
    elerhetoseg: "",
    jelszo: "",
    jelszoMegerosites: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const redirectTimeoutRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!isValidUsername(formData.nev)) {
      setError(
        "A felhasználónév érvénytelen. 3-30 karakter, betűk (ékezetes is), szám, szóköz, pont, kötőjel és aláhúzás engedett.",
      );
      return;
    }

    if (!isValidEmail(formData.elerhetoseg)) {
      setError("Érvényes email címet adj meg (kötelező @ és .).");
      return;
    }

    if (!isValidPassword(formData.jelszo)) {
      setError(
        "A jelszó legyen legalább 6 karakter, tartalmazzon betűt és számot, és ne legyen benne szóköz.",
      );
      return;
    }

    if (formData.jelszo !== formData.jelszoMegerosites) {
      setError("A jelszavak nem egyeznek.");
      return;
    }

    setLoading(true);

    try {
      await api.post("/auth/register", {
        nev: formData.nev.trim(),
        elerhetoseg: formData.elerhetoseg.trim(),
        jelszo: formData.jelszo,
      });

      setSuccess(
        "Sikeres regisztráció! Átirányítás a bejelentkezés oldalra...",
      );
      redirectTimeoutRef.current = setTimeout(() => {
        navigate("/ugyfelportal/login");
      }, 1700);
    } catch (err) {
      setError(err.response?.data?.message || "Regisztrációs hiba történt.");
    } finally {
      setLoading(false);
    }
  };

  const startProviderLogin = (provider) => {
    window.location.href = `${apiBase}/auth/${provider}/start`;
  };

  return (
    <div className="auth-page">
      <MotionDiv
        className="auth-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="auth-header">
          <h1>Regisztráció</h1>
          <p>Hozz létre egy új fiókot</p>
        </div>

        {error && (
          <MotionDiv
            className="error-message"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {error}
          </MotionDiv>
        )}

        {success && (
          <MotionDiv
            className="success-message"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {success}
          </MotionDiv>
        )}

        <div className="social-auth">
          <button
            type="button"
            className="social-btn google-btn"
            onClick={() => startProviderLogin("google")}
          >
            <span className="social-btn-content">
              <span className="social-icon" aria-hidden="true">
                <img src={googleIcon} alt="" />
              </span>
              <span>Folytatás Google-lel</span>
            </span>
          </button>

          <button
            type="button"
            className="social-btn github-btn"
            onClick={() => startProviderLogin("github")}
          >
            <span className="social-btn-content">
              <span className="social-icon" aria-hidden="true">
                <img src={githubIcon} alt="" />
              </span>
              <span>Folytatás GitHubbal</span>
            </span>
          </button>
        </div>

        <div className="auth-divider">
          <span>vagy</span>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label htmlFor="nev">Felhasználónév</label>
            <input
              type="text"
              id="nev"
              name="nev"
              value={formData.nev}
              onChange={handleChange}
              placeholder="pl. cyberuser_01"
              required
              autoComplete="name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="elerhetoseg">Email</label>
            <input
              type="text"
              id="elerhetoseg"
              name="elerhetoseg"
              value={formData.elerhetoseg}
              onChange={handleChange}
              placeholder="pelda@email.hu"
              required
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="jelszo">Jelszó</label>
            <input
              type="password"
              id="jelszo"
              name="jelszo"
              value={formData.jelszo}
              onChange={handleChange}
              placeholder="Min. 6 karakter"
              required
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="jelszoMegerosites">Jelszó megerősítése</label>
            <input
              type="password"
              id="jelszoMegerosites"
              name="jelszoMegerosites"
              value={formData.jelszoMegerosites}
              onChange={handleChange}
              placeholder="Jelszó újra"
              required
              autoComplete="new-password"
            />
          </div>

          <MotionButton
            type="submit"
            className="auth-btn"
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
          >
            {loading ? "Regisztráció..." : "Regisztráció"}
          </MotionButton>
        </form>

        <div className="auth-footer">
          <p>
            Van már fiókod? <Link to="/ugyfelportal/login">Bejelentkezés</Link>
          </p>
        </div>
      </MotionDiv>
    </div>
  );
};

export default Register;
