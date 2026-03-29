import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import "../styles/BookingFlow.css";
import {
  isValidEmail,
  isValidFullName,
  isValidName,
  isValidPhone,
} from "../utils/validation";
import { MENTORS } from "../data/mentors";

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
        setPickupTimes(
          Array.isArray(slotsResponse.data) ? slotsResponse.data : [],
        );
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Hiba tÄ‚Â¶rtÄ‚Â©nt a foglalÄ‚Ë‡si adatok betÄ‚Â¶ltÄ‚Â©sekor.",
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
    const grouped = Object.fromEntries(
      MENTORS.map((mentor) => [mentor.id, []]),
    );

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
      setError("KÄ‚Â©rlek vÄ‚Ë‡lassz mentort a tovÄ‚Ë‡bblÄ‚Â©pÄ‚Â©shez.");
      return;
    }
    setError("");
    setStep(2);
  };

  const handleSlotContinue = () => {
    if (!selectedSlot) {
      setError("KÄ‚Â©rlek vÄ‚Ë‡lassz egy elÄ‚Â©rhetÄąâ€ mentor idÄąâ€pontot.");
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
      setError("KÄ‚Â©rlek, tÄ‚Â¶lts ki minden kÄ‚Â¶telezÄąâ€ mezÄąâ€t.");
      return;
    }

    if (!isValidName(contactName)) {
      setError("A nÄ‚Â©v formÄ‚Ë‡tuma Ä‚Â©rvÄ‚Â©nytelen.");
      return;
    }

    if (!isValidFullName(billingName)) {
      setError("A szÄ‚Ë‡mlÄ‚Ë‡zÄ‚Ë‡si nÄ‚Â©vhez teljes nÄ‚Â©v szÄ‚Ä˝ksÄ‚Â©ges.");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Ä‚â€°rvÄ‚Â©nyes email cÄ‚Â­met adj meg.");
      return;
    }

    if (!isValidPhone(phone)) {
      setError("Ä‚â€°rvÄ‚Â©nyes telefonszÄ‚Ë‡mot adj meg.");
      return;
    }

    setError("");
    setStep(4);
  };

  const handleConfirm = async () => {
    if (!termsAccepted) {
      setError("KÄ‚Â©rlek fogadd el az Ä‚ÂSZF-et a foglalÄ‚Ë‡s vÄ‚Â©glegesÄ‚Â­tÄ‚Â©sÄ‚Â©hez.");
      return;
    }

    if (!selectedSlot || !selectedMentor) {
      setError("HiÄ‚Ë‡nyzÄ‚Ĺ‚ mentor vagy idÄąâ€pont. KÄ‚Â©rlek vÄ‚Ë‡laszd ki Ä‚Ĺźjra.");
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
      setError(
        err.response?.data?.message ||
          "Nem sikerÄ‚Ä˝lt vÄ‚Â©glegesÄ‚Â­teni a foglalÄ‚Ë‡st.",
      );
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
          <p className="loading-text">FoglalÄ‚Ë‡si folyamat betÄ‚Â¶ltÄ‚Â©se...</p>
        </div>
      </main>
    );
  }

  if (!server) {
    return (
      <main className="booking-flow-page">
        <div className="booking-shell">
          <p className="error-text">{error || "A szerver nem talÄ‚Ë‡lhatÄ‚Ĺ‚."}</p>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate("/termekek")}
          >
            Vissza a termÄ‚Â©kekhez
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
          <h1>MentorÄ‚Ë‡lt foglalÄ‚Ë‡si folyamat</h1>
          <p>
            VÄ‚Ë‡lassz mentort, idÄąâ€pontot, add meg a foglalÄ‚Ë‡si adatokat, majd
            vÄ‚Â©glegesÄ‚Â­tsd a foglalÄ‚Ë‡st.
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
            <small>NaptÄ‚Ë‡r</small>
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
            <small>Ä‚â€“sszegzÄ‚Â©s</small>
          </div>
          <div className="progress-line" />
          <div
            className={`progress-step ${step >= 5 ? "active" : ""} ${
              5 <= maxVisitedStep ? "clickable" : "locked"
            }`}
            onClick={() => handleProgressStepClick(5)}
          >
            <span>5</span>
            <small>KÄ‚Â©sz</small>
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
              <h2>VÄ‚Ë‡lassz mentort</h2>
              <p className="step-intro">
                A mentor a teljes folyamatban segÄ‚Â­t: elÄąâ€kÄ‚Â©szÄ‚Â­tÄ‚Â©s, kivÄ‚Ë‡lasztÄ‚Ë‡s,
                beÄ‚Ä˝zemelÄ‚Â©si tanÄ‚Ë‡csadÄ‚Ë‡s.
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
                    <img src={mentor.image} alt={`${mentor.name} profilkÄ‚Â©p`} />
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
                  Ă˘â€ Â Vissza a szerverhez
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleMentorContinue}
                >
                  IdÄąâ€pont vÄ‚Ë‡lasztÄ‚Ë‡s Ă˘â€ â€™
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
              <h2>Mentor naptÄ‚Ë‡ra</h2>
              <p className="step-intro">
                KivÄ‚Ë‡lasztott mentor:{" "}
                <strong>{selectedMentor?.name || "nincs kivÄ‚Ë‡lasztva"}</strong>
              </p>

              {selectedMentorSlots.length === 0 ? (
                <div className="empty-state">
                  <p>Ehhez a mentorhoz jelenleg nincs szabad idÄąâ€pont.</p>
                  <p>VÄ‚Ë‡lassz mÄ‚Ë‡sik mentort, vagy prÄ‚Ĺ‚bÄ‚Ë‡ld Ä‚Ĺźjra kÄ‚Â©sÄąâ€bb.</p>
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
                  Ă˘â€ Â Mentor mÄ‚Ĺ‚dosÄ‚Â­tÄ‚Ë‡sa
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleSlotContinue}
                  disabled={!selectedSlot}
                >
                  Adatok megadÄ‚Ë‡sa Ă˘â€ â€™
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
              <h2>FoglalÄ‚Ë‡si adatok</h2>
              <p className="step-intro">
                Add meg a szÄ‚Ä˝ksÄ‚Â©ges adatokat, hogy vÄ‚Â©glegesÄ‚Â­thetÄąâ€ legyen a
                foglalÄ‚Ë‡s.
              </p>

              <form
                className="booking-form-grid"
                noValidate
                onSubmit={(event) => {
                  event.preventDefault();
                  handleBookingDataContinue();
                }}
              >
                <label>
                  NÄ‚Â©v
                  <input
                    type="text"
                    name="contactName"
                    value={bookingData.contactName}
                    onChange={handleBookingDataChange}
                    placeholder="Teljes nÄ‚Â©v"
                    required
                  />
                </label>

                <label>
                  SzÄ‚Ë‡mlÄ‚Ë‡zÄ‚Ë‡si nÄ‚Â©v
                  <input
                    type="text"
                    name="billingName"
                    value={bookingData.billingName}
                    onChange={handleBookingDataChange}
                    placeholder="SzÄ‚Ë‡mlÄ‚Ë‡n szereplÄąâ€ nÄ‚Â©v"
                    required
                  />
                </label>

                <label>
                  Email cÄ‚Â­m
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
                  TelefonszÄ‚Ë‡m
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
                  MegjegyzÄ‚Â©s (opcionÄ‚Ë‡lis)
                  <textarea
                    name="note"
                    value={bookingData.note}
                    onChange={handleBookingDataChange}
                    rows={4}
                    placeholder="SpeciÄ‚Ë‡lis igÄ‚Â©nyek, kÄ‚Â©rdÄ‚Â©sek..."
                  />
                </label>

                <div className="step-actions wide-field">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setStep(2)}
                  >
                    Ă˘â€ Â Vissza a naptÄ‚Ë‡rhoz
                  </button>
                  <button type="submit" className="btn-primary">
                    Ä‚â€“sszegzÄ‚Â©s Ă˘â€ â€™
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
              <h2>FoglalÄ‚Ë‡s Ä‚Â¶sszesÄ‚Â­tÄ‚Â©se</h2>

              <div className="summary-grid">
                <article className="summary-card">
                  <h3>Szerver</h3>
                  <p>
                    <span>AzonosÄ‚Â­tÄ‚Ĺ‚:</span> <strong>#{server.id}</strong>
                  </p>
                  <p>
                    <span>CPU:</span> <strong>{server.cpu || "-"}</strong>
                  </p>
                  <p>
                    <span>RAM:</span> <strong>{server.ram || "-"}</strong>
                  </p>
                  <p>
                    <span>TÄ‚Ë‡rhely:</span> <strong>{server.hdd || "-"}</strong>
                  </p>
                </article>

                <article className="summary-card">
                  <h3>Mentor Ä‚Â©s idÄąâ€pont</h3>
                  <p>
                    <span>Mentor:</span> <strong>{selectedMentor.name}</strong>
                  </p>
                  <p>
                    <span>SzerepkÄ‚Â¶r:</span>{" "}
                    <strong>{selectedMentor.title}</strong>
                  </p>
                  <p>
                    <span>DÄ‚Ë‡tum:</span>{" "}
                    <strong>{formatDate(selectedSlot.atvetel_datum)}</strong>
                  </p>
                  <p>
                    <span>IdÄąâ€pont:</span>{" "}
                    <strong>{formatTime(selectedSlot.atvetel_idopont)}</strong>
                  </p>
                </article>

                <article className="summary-card">
                  <h3>Megadott adatok</h3>
                  <p>
                    <span>NÄ‚Â©v:</span> <strong>{bookingData.contactName}</strong>
                  </p>
                  <p>
                    <span>SzÄ‚Ë‡mlÄ‚Ë‡zÄ‚Ë‡si nÄ‚Â©v:</span>{" "}
                    <strong>{bookingData.billingName}</strong>
                  </p>
                  <p>
                    <span>Email:</span> <strong>{bookingData.email}</strong>
                  </p>
                  <p>
                    <span>TelefonszÄ‚Ë‡m:</span>{" "}
                    <strong>{bookingData.phone}</strong>
                  </p>
                  <p>
                    <span>MegjegyzÄ‚Â©s:</span>{" "}
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
                <span>
                  Elolvastam Ä‚Â©s elfogadom az Ä‚ÂltalÄ‚Ë‡nos SzerzÄąâ€dÄ‚Â©si FeltÄ‚Â©teleket.
                </span>
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
                  Ă˘â€ Â Adatok mÄ‚Ĺ‚dosÄ‚Â­tÄ‚Ë‡sa
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  disabled={!termsAccepted || loading}
                  onClick={handleConfirm}
                >
                  {loading ? "VÄ‚Â©glegesÄ‚Â­tÄ‚Â©s..." : "FoglalÄ‚Ë‡s vÄ‚Â©glegesÄ‚Â­tÄ‚Â©se"}
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
              <div className="success-check">Ă˘Ĺ›â€ś</div>
              <h2>Sikeres foglalÄ‚Ë‡s</h2>
              <p>
                A foglalÄ‚Ë‡s rÄ‚Â¶gzÄ‚Â­tve lett. A Ă˘â‚¬ĹľFoglalÄ‚Ë‡saimĂ˘â‚¬ĹĄ oldalon meg tudod
                nÄ‚Â©zni a rÄ‚Â©szleteket.
              </p>

              <div className="step-actions">
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => navigate("/ugyfelportal/dashboard")}
                >
                  IrÄ‚Ë‡ny a foglalÄ‚Ë‡saim oldalra
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => navigate("/termekek")}
                >
                  TovÄ‚Ë‡bbi szerverek
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
