import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import "../styles/Auth.css";
import googleIcon from "../assets/icons/google-color-icon.svg";
import githubIcon from "../assets/icons/github-white-icon.svg";
import { isValidEmail, isValidPassword } from "../utils/validation";

const MotionDiv = motion.div;
const MotionButton = motion.button;

const apiBase = (import.meta.env.VITE_API_BASE_URL || "/api").replace(
  /\/$/,
  "",
);

const Login = () => {
  const [formData, setFormData] = useState({
    elerhetoseg: "",
    jelszo: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isValidEmail(formData.elerhetoseg)) {
      setError("Érvényes email címet adj meg (kötelező @ és .).");
      return;
    }

    if (!isValidPassword(formData.jelszo)) {
      setError("A jelszó formátuma érvénytelen.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        elerhetoseg: formData.elerhetoseg.trim(),
        jelszo: formData.jelszo,
      });
      login(response.data.user, response.data.token);
      navigate("/ugyfelportal/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Bejelentkezési hiba történt.");
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
          <h1>Bejelentkezés</h1>
          <p>Lépj be a fiókodba</p>
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
              placeholder="********"
              required
              autoComplete="current-password"
            />
          </div>

          <MotionButton
            type="submit"
            className="auth-btn"
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
          >
            {loading ? "Bejelentkezés..." : "Bejelentkezés"}
          </MotionButton>
        </form>

        <div className="auth-footer">
          <p>
            Még nincs fiókod?{" "}
            <Link to="/ugyfelportal/register">Regisztráció</Link>
          </p>
        </div>
      </MotionDiv>
    </div>
  );
};

export default Login;
