import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { MENTOR_BY_ID } from "../data/mentors";
import "../styles/Dashboard.css";

const MotionDiv = motion.div;
const MotionButton = motion.button;

const emptyDraft = { pontszam: 5, review: "" };

const formatPontszam = (value) => {
  if (value == null || value === "") return "-";
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return "-";
  return numeric.toFixed(1);
};

const buildFallbackAvatar = (name) => {
  const initials = String(name || "M")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");

  const svg = `
    <svg xmlns='http://www.w3.org/2000/svg' width='96' height='96' viewBox='0 0 96 96'>
      <defs>
        <linearGradient id='g' x1='0' x2='1' y1='0' y2='1'>
          <stop offset='0%' stop-color='#00d4ff' />
          <stop offset='100%' stop-color='#1a1f42' />
        </linearGradient>
      </defs>
      <rect width='96' height='96' rx='48' fill='url(#g)' />
      <text x='48' y='56' text-anchor='middle' fill='white' font-size='30' font-family='Arial, sans-serif' font-weight='700'>${initials}</text>
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const getMentorImage = (mentorId, mentorName) => {
  const mentorMeta = mentorId ? MENTOR_BY_ID[mentorId] : null;
  return mentorMeta?.image || buildFallbackAvatar(mentorName || "Mentor");
};

const renderStaticStars = (value) => {
  const numeric = Number(value) || 0;
  return Array.from({ length: 5 }, (_, index) => {
    const starIndex = index + 1;
    let className = "empty";

    if (numeric >= starIndex) {
      className = "full";
    } else if (numeric >= starIndex - 0.5) {
      className = "half";
    }

    return (
      <span key={starIndex} className={`rating-star ${className}`}>
        ★
      </span>
    );
  });
};

const Dashboard = () => {
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [ratingDrafts, setRatingDrafts] = useState({});
  const [hoverRatings, setHoverRatings] = useState({});
  const [savingRatingFor, setSavingRatingFor] = useState(null);

  async function fetchReservations() {
    try {
      const response = await api.get("/foglalas/my");
      const fetchedReservations = Array.isArray(response.data)
        ? response.data
        : response.data?.foglalasok || [];

      setReservations(fetchedReservations);

      const nextDrafts = {};
      fetchedReservations.forEach((reservation) => {
        if (!reservation.mentor_id) return;
        nextDrafts[reservation.id] = {
          pontszam:
            reservation.mentor_pontszam != null
              ? Number(reservation.mentor_pontszam)
              : 5,
          review: reservation.mentor_review || "",
        };
      });
      setRatingDrafts(nextDrafts);
    } catch (err) {
      console.error("Error fetching reservations:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReservations();
  }, []);

  const reservationsWithMentor = useMemo(
    () => reservations.filter((reservation) => Boolean(reservation.mentor_id)),
    [reservations],
  );

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

  const updateRatingDraft = (reservationId, field, value) => {
    setRatingDrafts((prev) => ({
      ...prev,
      [reservationId]: {
        ...(prev[reservationId] || emptyDraft),
        [field]: value,
      },
    }));
  };

  const getVisualRating = (reservationId) => {
    if (hoverRatings[reservationId] != null) return hoverRatings[reservationId];
    return ratingDrafts[reservationId]?.pontszam ?? 5;
  };

  const pointerToRating = (event, starIndex) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const pointerX = event.clientX - rect.left;
    const half = pointerX <= rect.width / 2;
    return half ? starIndex - 0.5 : starIndex;
  };

  const handleStarHover = (reservationId, starIndex, event) => {
    const value = pointerToRating(event, starIndex);
    setHoverRatings((prev) => ({ ...prev, [reservationId]: value }));
  };

  const handleStarLeave = (reservationId) => {
    setHoverRatings((prev) => {
      const next = { ...prev };
      delete next[reservationId];
      return next;
    });
  };

  const handleStarClick = (reservationId, starIndex, event) => {
    const value = pointerToRating(event, starIndex);
    updateRatingDraft(reservationId, "pontszam", value);
    setHoverRatings((prev) => ({ ...prev, [reservationId]: value }));
  };

  const handleSaveMentorRating = async (reservation) => {
    const draft = ratingDrafts[reservation.id] || emptyDraft;
    setSavingRatingFor(reservation.id);

    try {
      await api.post("/ertekeles/mentor", {
        foglalas_id: reservation.id,
        pontszam: Number(draft.pontszam),
        review: draft.review,
      });

      setMessage("Mentor értékelés sikeresen mentve");
      await fetchReservations();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage(
        err.response?.data?.message || "Hiba történt az értékelés mentésekor",
      );
      setTimeout(() => setMessage(""), 3500);
    } finally {
      setSavingRatingFor(null);
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
        <h1>Üdv, {user?.nev}!</h1>
        <p className="user-role">
          Role: {user?.role === "admin" ? "Adminisztrator" : "Felhasznalo"}
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

                      {reservation.berlesi_kezdete && reservation.berlesi_vege && (
                        <div className="rental-period-display">
                          <p className="rental-label">Bérlési időszak:</p>
                          <p className="rental-dates">
                            {new Date(reservation.berlesi_kezdete).toLocaleDateString("hu-HU")}
                            {" -> "}
                            {new Date(reservation.berlesi_vege).toLocaleDateString("hu-HU")}
                          </p>
                        </div>
                      )}

                      {reservation.atvetel_datum && (
                        <div className="pickup-display">
                          <p className="pickup-label">Átvétel:</p>
                          <p className="pickup-datetime">
                            {new Date(reservation.atvetel_datum).toLocaleDateString("hu-HU")}
                            {reservation.atvetel_idopont &&
                              ` - ${reservation.atvetel_idopont.substring(0, 5)}`}
                          </p>
                        </div>
                      )}

                      {reservation.mentor_nev && (
                        <div className="mentor-display">
                          <img
                            src={getMentorImage(
                              reservation.mentor_id,
                              reservation.mentor_nev,
                            )}
                            alt={`${reservation.mentor_nev} profilkep`}
                            className="mentor-rating-avatar"
                          />
                          <div>
                            <p className="mentor-label">Mentor:</p>
                            <p className="mentor-value">{reservation.mentor_nev}</p>
                          </div>
                        </div>
                      )}

                      <p className="reservation-date">
                        <strong>Foglalás létrehozva:</strong>{" "}
                        {new Date(reservation.foglalas_datuma).toLocaleString("hu-HU")}
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

        <MotionDiv
          className="dashboard-section"
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.3 }}
        >
          <h2>Mentor értékelések</h2>

          {loading ? (
            <p>Betöltés...</p>
          ) : reservationsWithMentor.length === 0 ? (
            <p className="no-data">Még nincs mentoros foglalásod értékeléshez.</p>
          ) : (
            <div className="mentor-rating-list">
              {reservationsWithMentor.map((reservation) => {
                const ratingDraft = ratingDrafts[reservation.id] || emptyDraft;
                const visualRating = getVisualRating(reservation.id);
                const mentorImage = getMentorImage(
                  reservation.mentor_id,
                  reservation.mentor_nev,
                );
                const mentorAtlag =
                  reservation.mentor_atlag_pontszam != null
                    ? Number(reservation.mentor_atlag_pontszam)
                    : null;
                const mentorErtekelesDb = Number(reservation.mentor_ertekeles_db || 0);

                return (
                  <div key={`rating-${reservation.id}`} className="mentor-rating-card">
                    <div className="mentor-rating-head">
                      <img
                        src={mentorImage}
                        alt={`${reservation.mentor_nev || "Mentor"} profilkep`}
                        className="mentor-rating-avatar"
                      />
                      <div>
                        <p className="mentor-rating-title">{reservation.mentor_nev || "Mentor"}</p>
                        <p className="mentor-rating-subtitle">
                          Foglalas: #{reservation.id} - Szerver #{reservation.eszkoz_id}
                        </p>
                        <p className="mentor-rating-summary">
                          Mentor átlag: <strong>{formatPontszam(mentorAtlag)}</strong>
                          {mentorErtekelesDb > 0
                            ? ` (${mentorErtekelesDb} db)`
                            : " (meg nincs ertekeles)"}
                        </p>
                        <div className="mentor-rating-avg-stars">{renderStaticStars(mentorAtlag)}</div>
                      </div>
                    </div>

                    <div className="mentor-rating-input-row">
                      <p className="mentor-rating-label">
                        Saját pontszám: <strong>{formatPontszam(visualRating)}</strong>
                      </p>
                      <div
                        className="interactive-stars"
                        onMouseLeave={() => handleStarLeave(reservation.id)}
                      >
                        {Array.from({ length: 5 }, (_, index) => {
                          const starIndex = index + 1;
                          let className = "empty";
                          if (visualRating >= starIndex) {
                            className = "full";
                          } else if (visualRating >= starIndex - 0.5) {
                            className = "half";
                          }

                          return (
                            <button
                              key={`${reservation.id}-${starIndex}`}
                              type="button"
                              className={`interactive-star ${className}`}
                              onMouseMove={(event) =>
                                handleStarHover(reservation.id, starIndex, event)
                              }
                              onClick={(event) =>
                                handleStarClick(reservation.id, starIndex, event)
                              }
                              aria-label={`${starIndex} csillag`}
                            >
                              ★
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <textarea
                      className="mentor-review-input"
                      rows="3"
                      placeholder="Rövid értékelés a mentor munkájáról (opcionális)"
                      value={ratingDraft.review}
                      onChange={(event) =>
                        updateRatingDraft(reservation.id, "review", event.target.value)
                      }
                    />

                    <MotionButton
                      className="save-rating-btn"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      disabled={savingRatingFor === reservation.id}
                      onClick={() => handleSaveMentorRating(reservation)}
                    >
                      {savingRatingFor === reservation.id ? "Mentés..." : "Értékelés küldése"}
                    </MotionButton>
                  </div>
                );
              })}
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
              Admin funkciók késöbb bővíthetők (pl. összes foglalás megtekintése,
              szerver kezelés, stb.)
            </p>
          </MotionDiv>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
