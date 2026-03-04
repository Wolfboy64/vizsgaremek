import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../services/api";
import "../styles/ServerDetails.css";

const MotionSection = motion.section;

const buildServerImage = (server) => {
  const title = `Szerver #${server.id}`;
  const cpu = server.cpu || "CPU adat nélkül";
  const ram = server.ram || "RAM adat nélkül";
  const hdd = server.hdd || "Tárhely adat nélkül";

  const svg = `
    <svg xmlns='http://www.w3.org/2000/svg' width='960' height='420' viewBox='0 0 960 420'>
      <defs>
        <linearGradient id='bg' x1='0' x2='1' y1='0' y2='1'>
          <stop offset='0%' stop-color='#0ea5e9' />
          <stop offset='55%' stop-color='#2563eb' />
          <stop offset='100%' stop-color='#0f172a' />
        </linearGradient>
      </defs>
      <rect width='960' height='420' fill='url(#bg)' />
      <rect x='68' y='96' width='824' height='228' rx='20' fill='rgba(2,6,23,0.42)' stroke='rgba(255,255,255,0.18)' />
      <text x='100' y='156' fill='white' font-size='42' font-family='Arial, sans-serif' font-weight='700'>${title}</text>
      <text x='100' y='210' fill='white' font-size='24' font-family='Arial, sans-serif'>${cpu}</text>
      <text x='100' y='252' fill='white' font-size='24' font-family='Arial, sans-serif'>${ram}</text>
      <text x='100' y='294' fill='white' font-size='24' font-family='Arial, sans-serif'>${hdd}</text>
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const ServerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [server, setServer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchServer = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await api.get(`/eszkoz/${id}`);
        setServer(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Nem sikerült betölteni a szervert.");
      } finally {
        setLoading(false);
      }
    };

    fetchServer();
  }, [id]);

  if (loading) {
    return (
      <main className="server-details-page">
        <div className="server-details-shell">
          <p className="loading-text">Szerver adatainak betöltése...</p>
        </div>
      </main>
    );
  }

  if (error || !server) {
    return (
      <main className="server-details-page">
        <div className="server-details-shell">
          <p className="error-text">{error || "A szerver nem található."}</p>
          <button
            type="button"
            className="details-secondary-btn"
            onClick={() => navigate("/termekek")}
          >
            Vissza a termékekhez
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="server-details-page">
      <MotionSection
        className="server-details-shell"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="details-header">
          <span className="server-chip">Részletes információ</span>
          <h1>Szerver #{server.id}</h1>
          <p>
            Válaszd ki ezt a konfigurációt, majd a következő oldalon mentorral és
            időponttal végig tudod vinni a foglalást.
          </p>
        </div>

        <div className="details-layout">
          <article className="details-main">
            <img
              src={buildServerImage(server)}
              alt={`Szerver ${server.id} illusztráció`}
              className="server-cover-image"
            />

            <ul className="details-bullet-list">
              <li>
                <strong>CPU:</strong> {server.cpu || "-"}
              </li>
              <li>
                <strong>RAM:</strong> {server.ram || "-"}
              </li>
              <li>
                <strong>Tárhely:</strong> {server.hdd || "-"}
              </li>
              <li>
                <strong>Leírás:</strong>{" "}
                {server.leiras || "Ehhez a szerverhez nincs külön leírás megadva."}
              </li>
              <li>
                <strong>Üzemeltető:</strong>{" "}
                {server.uzemelteto_nev || "Nincs hozzárendelve"}
              </li>
              <li>
                <strong>Üzemeltetői információ:</strong>{" "}
                {server.uzemelteto_leiras ||
                  "Az üzemeltetőről jelenleg nincs részletes leírás."}
              </li>
            </ul>
          </article>

          <aside className="details-side-card">
            <h2>Következő lépés</h2>
            <p>
              Indítsd el a foglalási folyamatot, válassz mentort, majd foglalj
              időpontot.
            </p>
            <button
              type="button"
              className="details-primary-btn"
              onClick={() => navigate(`/termekek/${id}/foglalas`)}
            >
              Foglalás megkezdése →
            </button>
            <button
              type="button"
              className="details-secondary-btn"
              onClick={() => navigate("/termekek")}
            >
              ← Vissza a listához
            </button>
          </aside>
        </div>
      </MotionSection>
    </main>
  );
};

export default ServerDetails;
