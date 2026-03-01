import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import "../styles/Auth.css";

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
    setLoading(true);

    try {
      const response = await api.post("/auth/login", formData);
      login(response.data.user, response.data.token);
      navigate("/ugyfelportal/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Bejelentkezési hiba történt");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <motion.div
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
          <motion.div
            className="error-message"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="elerhetoseg">Email / Elérhetőség</label>
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
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          <motion.button
            type="submit"
            className="auth-btn"
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
          >
            {loading ? "Bejelentkezés..." : "Bejelentkezés"}
          </motion.button>
        </form>

        <div className="auth-footer">
          <p>
            Még nincs fiókod?{" "}
            <Link to="/ugyfelportal/register">Regisztráció</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
