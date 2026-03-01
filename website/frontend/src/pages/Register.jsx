import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../services/api";
import "../styles/Auth.css";

const Register = () => {
  const [formData, setFormData] = useState({
    nev: "",
    elerhetoseg: "",
    jelszo: "",
    jelszoMegerosites: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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

    if (formData.jelszo !== formData.jelszoMegerosites) {
      setError("A jelszavak nem egyeznek");
      return;
    }

    if (formData.jelszo.length < 6) {
      setError("A jelszónak legalább 6 karakter hosszúnak kell lennie");
      return;
    }

    setLoading(true);

    try {
      await api.post("/auth/register", {
        nev: formData.nev,
        elerhetoseg: formData.elerhetoseg,
        jelszo: formData.jelszo,
      });

      alert("Sikeres regisztráció! Most már bejelentkezhetsz.");
      navigate("/ugyfelportal/login");
    } catch (err) {
      setError(err.response?.data?.message || "Regisztrációs hiba történt");
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
          <h1>Regisztráció</h1>
          <p>Hozz létre egy új fiókot</p>
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
            <label htmlFor="nev">Teljes név</label>
            <input
              type="text"
              id="nev"
              name="nev"
              value={formData.nev}
              onChange={handleChange}
              placeholder="Kovács János"
              required
              autoComplete="name"
            />
          </div>

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

          <motion.button
            type="submit"
            className="auth-btn"
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
          >
            {loading ? "Regisztráció..." : "Regisztráció"}
          </motion.button>
        </form>

        <div className="auth-footer">
          <p>
            Van már fiókod? <Link to="/ugyfelportal/login">Bejelentkezés</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
