import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "../styles/Dashboard.css";

const Dashboard = () => {
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const response = await api.get("/foglalas/my");
      setReservations(response.data.foglalasok);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching reservations:", err);
      setLoading(false);
    }
  };

  const handleCancelReservation = async (id) => {
    if (!window.confirm("Biztosan törölni szeretnéd ezt a foglalást?")) {
      return;
    }

    try {
      await api.delete(`/foglalas/${id}`);
      setMessage("Foglalás sikeresen törölve");
      fetchReservations();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || "Hiba történt a törlés során");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="dashboard-page">
      <motion.div
        className="dashboard-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1>Üdvözöllek, {user?.nev}!</h1>
        <p className="user-role">
          Role: {user?.role === "admin" ? "Adminisztrátor" : "Felhasználó"}
        </p>
      </motion.div>

      <div className="container">
        {message && (
          <motion.div
            className="dashboard-message"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {message}
          </motion.div>
        )}

        <motion.div
          className="dashboard-section"
          variants={fadeIn}
          initial="hidden"
          animate="visible"
        >
          <h2>Profilinformációk</h2>
          <div className="profile-info">
            <div className="info-row">
              <span className="info-label">Név:</span>
              <span className="info-value">{user?.nev}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Elérhetőség:</span>
              <span className="info-value">{user?.elerhetoseg}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Szerepkör:</span>
              <span className="info-value">
                {user?.role === "admin" ? "Adminisztrátor" : "Felhasználó"}
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="dashboard-section"
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2 }}
        >
          <h2>Foglalásaim</h2>

          {loading ? (
            <p>Betöltés...</p>
          ) : reservations.length === 0 ? (
            <p className="no-data">Még nincs aktív foglalásod</p>
          ) : (
            <div className="reservations-list">
              {reservations.map((reservation) => (
                <motion.div
                  key={reservation.id}
                  className="reservation-card"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="reservation-info">
                    <h3>Szerver #{reservation.eszkoz_id}</h3>
                    <div className="reservation-details">
                      <p>
                        <strong>CPU:</strong> {reservation.cpu}
                      </p>
                      <p>
                        <strong>RAM:</strong> {reservation.ram}
                      </p>
                      <p>
                        <strong>HDD:</strong> {reservation.hdd}
                      </p>
                      {reservation.eszkoz_leiras && (
                        <p>
                          <strong>Leírás:</strong> {reservation.eszkoz_leiras}
                        </p>
                      )}

                      {/* Bérlési időszak */}
                      {reservation.berlesi_kezdete &&
                        reservation.berlesi_vege && (
                          <div className="rental-period-display">
                            <p className="rental-label">📅 Bérlési időszak:</p>
                            <p className="rental-dates">
                              {new Date(
                                reservation.berlesi_kezdete,
                              ).toLocaleDateString("hu-HU")}
                              {" → "}
                              {new Date(
                                reservation.berlesi_vege,
                              ).toLocaleDateString("hu-HU")}
                            </p>
                            <p className="rental-duration">
                              (
                              {Math.ceil(
                                (new Date(reservation.berlesi_vege) -
                                  new Date(reservation.berlesi_kezdete)) /
                                  (1000 * 60 * 60 * 24),
                              )}{" "}
                              nap)
                            </p>
                          </div>
                        )}

                      {/* Átvételi időpont */}
                      {reservation.atvetel_datum && (
                        <div className="pickup-display">
                          <p className="pickup-label">🚗 Átvétel:</p>
                          <p className="pickup-datetime">
                            {new Date(
                              reservation.atvetel_datum,
                            ).toLocaleDateString("hu-HU")}
                            {reservation.atvetel_idopont &&
                              ` - ${reservation.atvetel_idopont.substring(0, 5)}`}
                          </p>
                        </div>
                      )}

                      <p className="reservation-date">
                        <strong>Foglalás létrehozva:</strong>{" "}
                        {new Date(reservation.foglalas_datuma).toLocaleString(
                          "hu-HU",
                        )}
                      </p>
                    </div>
                  </div>
                  <motion.button
                    className="cancel-btn"
                    onClick={() => handleCancelReservation(reservation.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Törlés
                  </motion.button>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {user?.role === "admin" && (
          <motion.div
            className="dashboard-section admin-section"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.4 }}
          >
            <h2>Admin Funkciók</h2>
            <p>
              Admin funkciók később bővíthetők (pl. összes foglalás
              megtekintése, szerver kezelés, stb.)
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
