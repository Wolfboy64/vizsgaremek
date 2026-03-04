import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "../styles/Dashboard.css";

const MotionDiv = motion.div;
const MotionButton = motion.button;

const Dashboard = () => {
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function fetchReservations() {
    try {
      const response = await api.get("/foglalas/my");
      const fetchedReservations = Array.isArray(response.data)
        ? response.data
        : response.data?.foglalasok || [];
      setReservations(fetchedReservations);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching reservations:", err);
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchReservations();
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const handleCancelReservation = async (id) => {
    if (!window.confirm("Biztosan szeretnéd törölni a foglalást?")) {
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
      <MotionDiv
        className="dashboard-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1>Üdvözöllek, {user?.nev}!</h1>
        <p className="user-role">
          Role: {user?.role === "admin" ? "Adminisztrátor" : "Felhasználó"}
        </p>
      </MotionDiv>

      <div className="container">
        {message && (
          <MotionDiv
            className="dashboard-message"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {message}
          </MotionDiv>
        )}

        <MotionDiv
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
        </MotionDiv>

        <MotionDiv
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
                <MotionDiv
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

                      {reservation.mentor_nev && (
                        <div className="mentor-display">
                          <p className="mentor-label">🧑‍🏫 Mentor:</p>
                          <p className="mentor-value">
                            {reservation.mentor_nev}
                          </p>
                        </div>
                      )}

                      {reservation.ugyfel_nev && (
                        <p>
                          <strong>Név:</strong> {reservation.ugyfel_nev}
                        </p>
                      )}

                      {reservation.szamlazasi_nev && (
                        <p>
                          <strong>Számlázási név:</strong>{" "}
                          {reservation.szamlazasi_nev}
                        </p>
                      )}

                      {reservation.email && (
                        <p>
                          <strong>Email:</strong> {reservation.email}
                        </p>
                      )}

                      {reservation.telefon && (
                        <p>
                          <strong>Telefon:</strong> {reservation.telefon}
                        </p>
                      )}

                      {reservation.megjegyzes && (
                        <p>
                          <strong>Megjegyzés:</strong> {reservation.megjegyzes}
                        </p>
                      )}

                      <p className="reservation-date">
                        <strong>Foglalás létrehozva:</strong>{" "}
                        {new Date(reservation.foglalas_datuma).toLocaleString(
                          "hu-HU",
                        )}
                      </p>
                    </div>
                  </div>
                  <MotionButton
                    className="cancel-btn"
                    onClick={() => handleCancelReservation(reservation.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Törlés
                  </MotionButton>
                </MotionDiv>
              ))}
            </div>
          )}
        </MotionDiv>

        {user?.role === "admin" && (
          <MotionDiv
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
          </MotionDiv>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
