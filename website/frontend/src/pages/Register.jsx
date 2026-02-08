import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import "../styles/Login.css";

const Register = () => {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [nev, setNev] = useState("");
  const [elerhetoseg, setElerhetoseg] = useState("");
  const [jelszo, setJelszo] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!nev || !elerhetoseg || !jelszo) {
      setError("Minden mező kitöltése kötelező.");
      return;
    }

    const result = await register(nev, elerhetoseg, jelszo);
    if (result.ok) {
      setSuccess("Sikeres regisztráció. Most már be tudsz jelentkezni.");
      setTimeout(() => navigate("/login"), 800);
    } else {
      setError(result.message || "Sikertelen regisztráció.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Regisztráció</h1>
        <p className="login-subtitle">Hozz létre új fiókot.</p>

        <form onSubmit={handleSubmit} className="login-form">
          <label>
            Név
            <input
              type="text"
              value={nev}
              onChange={(event) => setNev(event.target.value)}
              placeholder="Teljes név"
              autoComplete="name"
            />
          </label>

          <label>
            Elérhetőség (email)
            <input
              type="email"
              value={elerhetoseg}
              onChange={(event) => setElerhetoseg(event.target.value)}
              placeholder="email@pelda.hu"
              autoComplete="email"
            />
          </label>

          <label>
            Jelszó (min. 6 karakter)
            <input
              type="password"
              value={jelszo}
              onChange={(event) => setJelszo(event.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </label>

          {error ? <div className="login-error">{error}</div> : null}
          {success ? <div className="login-success">{success}</div> : null}

          <button type="submit" disabled={loading}>
            {loading ? "Regisztráció..." : "Fiók létrehozása"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
