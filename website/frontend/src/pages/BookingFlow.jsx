import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import "../styles/BookingFlow.css";

const buildAvatar = (name, color) => {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");

  const svg = `
    <svg xmlns='http://www.w3.org/2000/svg' width='160' height='120' viewBox='0 0 160 120'>
      <defs>
        <linearGradient id='g' x1='0' x2='1' y1='0' y2='1'>
          <stop offset='0%' stop-color='${color}' />
          <stop offset='100%' stop-color='#0f1a3e' />
        </linearGradient>
      </defs>
      <rect width='160' height='120' fill='url(#g)' />
      <circle cx='80' cy='48' r='22' fill='rgba(255,255,255,0.2)' />
      <rect x='42' y='78' width='76' height='24' rx='12' fill='rgba(255,255,255,0.2)' />
      <text x='80' y='114' text-anchor='middle' fill='white' font-size='20' font-family='Arial, sans-serif' font-weight='700'>${initials}</text>
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const MENTORS = [
  {
    id: "mentor-kiss-anna",
    name: "Kiss Anna",
    title: "Cloud infrastruktúra mentor",
    expertise: [
      "Linux szerver üzemeltetés",
      "Terraform és IaC alapok",
      "AWS / Azure induló projektek",
    ],
    image: buildAvatar("Kiss Anna", "#0ea5e9"),
  },
  {
    id: "mentor-toth-david",
    name: "Tóth Dávid",
    title: "DevOps és automatizálás mentor",
    expertise: [
      "CI/CD pipeline építés",
      "Docker és konténeres deploy",
      "Monitoring és hibatűrés",
    ],
    image: buildAvatar("Tóth Dávid", "#14b8a6"),
  },
  {
    id: "mentor-varga-lili",
    name: "Varga Lili",
    title: "Backend és adatbázis mentor",
    expertise: [
      "Node.js backend architektúra",
      "SQL teljesítmény-optimalizálás",
      "API tervezés és biztonság",
    ],
    image: buildAvatar("Varga Lili", "#f97316"),
  },
];

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString("hu-HU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const formatTime = (timeString) => String(timeString).slice(0, 5);

const MotionSection = motion.section;

const BookingFlow = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [server, setServer] = useState(null);
  const [pickupTimes, setPickupTimes] = useState([]);
  const [selectedMentorId, setSelectedMentorId] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [step, setStep] = useState(1);
  const [maxVisitedStep, setMaxVisitedStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [error, setError] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [bookingData, setBookingData] = useState({
    contactName: user?.nev || "",
    billingName: "",
    email: user?.elerhetoseg || "",
    phone: "",
    note: "",
  });

  useEffect(() => {
    setBookingData((prev) => ({
      ...prev,
      contactName: prev.contactName || user?.nev || "",
      email: prev.email || user?.elerhetoseg || "",
    }));
  }, [user]);

  useEffect(() => {
    setMaxVisitedStep((prev) => Math.max(prev, step));
  }, [step]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsPageLoading(true);
        setError("");

        const [serverResponse, slotsResponse] = await Promise.all([
          api.get(`/eszkoz/${id}`),
          api.get(`/idopont/eszkoz/${id}`),
        ]);

        setServer(serverResponse.data);
        setPickupTimes(Array.isArray(slotsResponse.data) ? slotsResponse.data : []);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Hiba történt a foglalási adatok betöltésekor.",
        );
      } finally {
        setIsPageLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const selectedMentor = useMemo(
    () => MENTORS.find((mentor) => mentor.id === selectedMentorId) || null,
    [selectedMentorId],
  );

  const mentorSlots = useMemo(() => {
    const grouped = Object.fromEntries(MENTORS.map((mentor) => [mentor.id, []]));

    pickupTimes.forEach((slot, index) => {
      const mentor = MENTORS[index % MENTORS.length];
      if (!grouped[mentor.id]) {
        grouped[mentor.id] = [];
      }
      grouped[mentor.id].push(slot);
    });

    return grouped;
  }, [pickupTimes]);

  const selectedMentorSlots = useMemo(() => {
    if (!selectedMentorId) return [];
    return mentorSlots[selectedMentorId] || [];
  }, [selectedMentorId, mentorSlots]);

  const handleMentorContinue = () => {
    if (!selectedMentor) {
      setError("Kérlek válassz mentort a továbblépéshez.");
      return;
    }
    setError("");
    setStep(2);
  };

  const handleSlotContinue = () => {
    if (!selectedSlot) {
      setError("Kérlek válassz egy elérhető mentor időpontot.");
      return;
    }
    setError("");
    setStep(3);
  };

  const handleBookingDataChange = (event) => {
    const { name, value } = event.target;
    setBookingData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleBookingDataContinue = () => {
    const { contactName, billingName, email, phone } = bookingData;

    if (
      !contactName.trim() ||
      !billingName.trim() ||
      !email.trim() ||
      !phone.trim()
    ) {
      setError("Kérlek tölts ki minden kötelező mezőt.");
      return;
    }

    setError("");
    setStep(4);
  };

  const handleConfirm = async () => {
    if (!termsAccepted) {
      setError("Kérlek fogadd el az ÁSZF-et a foglalás véglegesítéséhez.");
      return;
    }

    if (!selectedSlot || !selectedMentor) {
      setError("Hiányzó mentor vagy időpont. Kérlek válaszd ki újra.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await api.post("/foglalas", {
        eszkoz_id: Number(id),
        idopont_id: selectedSlot.id,
        mentor_id: selectedMentor.id,
        mentor_nev: selectedMentor.name,
        ugyfel_nev: bookingData.contactName.trim(),
        szamlazasi_nev: bookingData.billingName.trim(),
        email: bookingData.email.trim(),
        telefon: bookingData.phone.trim(),
        megjegyzes: bookingData.note.trim(),
      });

      setStep(5);
    } catch (err) {
      setError(err.response?.data?.message || "Nem sikerült véglegesíteni a foglalást.");
    } finally {
      setLoading(false);
    }
  };

  const handleProgressStepClick = (targetStep) => {
    if (targetStep > maxVisitedStep) return;
    setError("");
    setStep(targetStep);
  };

  if (isPageLoading) {
    return (
      <main className="booking-flow-page">
        <div className="booking-shell">
          <p className="loading-text">Foglalási folyamat betöltése...</p>
        </div>
      </main>
    );
  }

  if (!server) {
    return (
      <main className="booking-flow-page">
        <div className="booking-shell">
          <p className="error-text">{error || "A szerver nem található."}</p>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate("/termekek")}
          >
            Vissza a termékekhez
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="booking-flow-page">
      <section className="booking-shell">
        <header className="booking-header">
          <span className="server-chip">Szerver #{server.id}</span>
          <h1>Mentorált foglalási folyamat</h1>
          <p>
            Válassz mentort, időpontot, add meg a foglalási adatokat, majd
            véglegesítsd a foglalást.
          </p>
        </header>

        <div className="booking-progress">
          <div
            className={`progress-step ${step >= 1 ? "active" : ""} ${
              1 <= maxVisitedStep ? "clickable" : "locked"
            }`}
            onClick={() => handleProgressStepClick(1)}
          >
            <span>1</span>
            <small>Mentor</small>
          </div>
          <div className="progress-line" />
          <div
            className={`progress-step ${step >= 2 ? "active" : ""} ${
              2 <= maxVisitedStep ? "clickable" : "locked"
            }`}
            onClick={() => handleProgressStepClick(2)}
          >
            <span>2</span>
            <small>Naptár</small>
          </div>
          <div className="progress-line" />
          <div
            className={`progress-step ${step >= 3 ? "active" : ""} ${
              3 <= maxVisitedStep ? "clickable" : "locked"
            }`}
            onClick={() => handleProgressStepClick(3)}
          >
            <span>3</span>
            <small>Adatok</small>
          </div>
          <div className="progress-line" />
          <div
            className={`progress-step ${step >= 4 ? "active" : ""} ${
              4 <= maxVisitedStep ? "clickable" : "locked"
            }`}
            onClick={() => handleProgressStepClick(4)}
          >
            <span>4</span>
            <small>Összegzés</small>
          </div>
          <div className="progress-line" />
          <div
            className={`progress-step ${step >= 5 ? "active" : ""} ${
              5 <= maxVisitedStep ? "clickable" : "locked"
            }`}
            onClick={() => handleProgressStepClick(5)}
          >
            <span>5</span>
            <small>Kész</small>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <AnimatePresence mode="wait">
          {step === 1 && (
            <MotionSection
              key="mentor-step"
              className="step-card"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2>Válassz mentort</h2>
              <p className="step-intro">
                A mentor a teljes folyamatban segít: előkészítés, kiválasztás,
                beüzemelési tanácsadás.
              </p>

              <div className="mentor-grid">
                {MENTORS.map((mentor) => (
                  <button
                    type="button"
                    key={mentor.id}
                    className={`mentor-card ${
                      selectedMentorId === mentor.id ? "selected" : ""
                    }`}
                    onClick={() => {
                      setSelectedMentorId(mentor.id);
                      setSelectedSlot(null);
                      setError("");
                    }}
                  >
                    <img src={mentor.image} alt={`${mentor.name} profilkép`} />
                    <h3>{mentor.name}</h3>
                    <p className="mentor-title">{mentor.title}</p>
                    <ul>
                      {mentor.expertise.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </button>
                ))}
              </div>

              <div className="step-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => navigate(`/termekek/${id}`)}
                >
                  ← Vissza a szerverhez
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleMentorContinue}
                >
                  Időpont választás →
                </button>
              </div>
            </MotionSection>
          )}

          {step === 2 && (
            <MotionSection
              key="calendar-step"
              className="step-card"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2>Mentor naptára</h2>
              <p className="step-intro">
                Kiválasztott mentor:{" "}
                <strong>{selectedMentor?.name || "nincs kiválasztva"}</strong>
              </p>

              {selectedMentorSlots.length === 0 ? (
                <div className="empty-state">
                  <p>Ehhez a mentorhoz jelenleg nincs szabad időpont.</p>
                  <p>Válassz másik mentort, vagy próbáld újra később.</p>
                </div>
              ) : (
                <div className="slot-grid">
                  {selectedMentorSlots.map((slot) => (
                    <button
                      key={slot.id}
                      type="button"
                      className={`slot-card ${
                        selectedSlot?.id === slot.id ? "selected" : ""
                      }`}
                      onClick={() => {
                        setSelectedSlot(slot);
                        setError("");
                      }}
                    >
                      <span>{formatDate(slot.atvetel_datum)}</span>
                      <strong>{formatTime(slot.atvetel_idopont)}</strong>
                    </button>
                  ))}
                </div>
              )}

              <div className="step-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setStep(1)}
                >
                  ← Mentor módosítása
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleSlotContinue}
                  disabled={!selectedSlot}
                >
                  Adatok megadása →
                </button>
              </div>
            </MotionSection>
          )}

          {step === 3 && (
            <MotionSection
              key="data-step"
              className="step-card"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2>Foglalási adatok</h2>
              <p className="step-intro">
                Add meg a szükséges adatokat, hogy véglegesíthető legyen a
                foglalás.
              </p>

              <form
                className="booking-form-grid"
                onSubmit={(event) => {
                  event.preventDefault();
                  handleBookingDataContinue();
                }}
              >
                <label>
                  Név
                  <input
                    type="text"
                    name="contactName"
                    value={bookingData.contactName}
                    onChange={handleBookingDataChange}
                    placeholder="Teljes név"
                    required
                  />
                </label>

                <label>
                  Számlázási név
                  <input
                    type="text"
                    name="billingName"
                    value={bookingData.billingName}
                    onChange={handleBookingDataChange}
                    placeholder="Számlán szereplő név"
                    required
                  />
                </label>

                <label>
                  Email cím
                  <input
                    type="email"
                    name="email"
                    value={bookingData.email}
                    onChange={handleBookingDataChange}
                    placeholder="pelda@email.hu"
                    required
                  />
                </label>

                <label>
                  Telefonszám
                  <input
                    type="tel"
                    name="phone"
                    value={bookingData.phone}
                    onChange={handleBookingDataChange}
                    placeholder="+36 30 123 4567"
                    required
                  />
                </label>

                <label className="wide-field">
                  Megjegyzés (opcionális)
                  <textarea
                    name="note"
                    value={bookingData.note}
                    onChange={handleBookingDataChange}
                    rows={4}
                    placeholder="Speciális igények, kérdések..."
                  />
                </label>

                <div className="step-actions wide-field">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setStep(2)}
                  >
                    ← Vissza a naptárhoz
                  </button>
                  <button type="submit" className="btn-primary">
                    Összegzés →
                  </button>
                </div>
              </form>
            </MotionSection>
          )}

          {step === 4 && selectedMentor && selectedSlot && (
            <MotionSection
              key="summary-step"
              className="step-card"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2>Foglalás összesítése</h2>

              <div className="summary-grid">
                <article className="summary-card">
                  <h3>Szerver</h3>
                  <p>
                    <span>Azonosító:</span> <strong>#{server.id}</strong>
                  </p>
                  <p>
                    <span>CPU:</span> <strong>{server.cpu || "-"}</strong>
                  </p>
                  <p>
                    <span>RAM:</span> <strong>{server.ram || "-"}</strong>
                  </p>
                  <p>
                    <span>Tárhely:</span> <strong>{server.hdd || "-"}</strong>
                  </p>
                </article>

                <article className="summary-card">
                  <h3>Mentor és időpont</h3>
                  <p>
                    <span>Mentor:</span> <strong>{selectedMentor.name}</strong>
                  </p>
                  <p>
                    <span>Szerepkör:</span> <strong>{selectedMentor.title}</strong>
                  </p>
                  <p>
                    <span>Dátum:</span>{" "}
                    <strong>{formatDate(selectedSlot.atvetel_datum)}</strong>
                  </p>
                  <p>
                    <span>Időpont:</span>{" "}
                    <strong>{formatTime(selectedSlot.atvetel_idopont)}</strong>
                  </p>
                </article>

                <article className="summary-card">
                  <h3>Megadott adatok</h3>
                  <p>
                    <span>Név:</span> <strong>{bookingData.contactName}</strong>
                  </p>
                  <p>
                    <span>Számlázási név:</span>{" "}
                    <strong>{bookingData.billingName}</strong>
                  </p>
                  <p>
                    <span>Email:</span> <strong>{bookingData.email}</strong>
                  </p>
                  <p>
                    <span>Telefonszám:</span> <strong>{bookingData.phone}</strong>
                  </p>
                  <p>
                    <span>Megjegyzés:</span>{" "}
                    <strong>{bookingData.note || "Nincs megadva"}</strong>
                  </p>
                </article>
              </div>

              <label className="terms-row">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(event) => setTermsAccepted(event.target.checked)}
                />
                <span>Elolvastam és elfogadom az Általános Szerződési Feltételeket.</span>
              </label>

              <div className="step-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setTermsAccepted(false);
                    setStep(3);
                  }}
                >
                  ← Adatok módosítása
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  disabled={!termsAccepted || loading}
                  onClick={handleConfirm}
                >
                  {loading ? "Véglegesítés..." : "Foglalás véglegesítése"}
                </button>
              </div>
            </MotionSection>
          )}

          {step === 5 && (
            <MotionSection
              key="success-step"
              className="step-card success-card"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="success-check">✓</div>
              <h2>Sikeres foglalás</h2>
              <p>
                A foglalás rögzítve lett. A dashboard oldalon meg tudod nézni a
                részleteket.
              </p>

              <div className="step-actions">
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => navigate("/ugyfelportal/dashboard")}
                >
                  Irány a dashboard
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => navigate("/termekek")}
                >
                  További szerverek
                </button>
              </div>
            </MotionSection>
          )}
        </AnimatePresence>
      </section>
    </main>
  );
};

export default BookingFlow;
