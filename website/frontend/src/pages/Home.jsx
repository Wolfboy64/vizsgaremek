import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/Home.css";

const MAIN_TITLE = "CyberNest, ahol nemcsak tanulhatsz";
const TYPE_SPEED = 55;
const DELETE_SPEED = 30;
const HOLD_AFTER_TYPED = 5000;
const HOLD_AFTER_DELETED = 300;

const getInitials = (name) => {
  const trimmed = String(name || "").trim();
  if (!trimmed) return "U";

  const parts = trimmed.split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() || "").join("") || "U";
};

const CARDS_PER_VIEW = 2;
const CARD_GAP = 14;
const REPEAT_BLOCKS = 120;
const REVIEW_BADGES = [
  "Ellenőrzött vásárlás",
  "Top értékelő",
  "2+ éve ügyfél",
  "Visszatérő ügyfél",
  "Ajánlott partner",
];

const normalizeLoopIndex = (index, length) => {
  if (length <= 0) return 0;

  const blockSize = length * REPEAT_BLOCKS;
  const anchorBlock = Math.floor(REPEAT_BLOCKS / 2);
  const min = length;
  const maxExclusive = blockSize - length;
  let next = index;

  if (next < min || next >= maxExclusive) {
    const modulo = ((next % length) + length) % length;
    next = anchorBlock * length + modulo;
  }

  return next;
};

const getReviewBadge = (review, index) =>
  String(review?.badge || REVIEW_BADGES[index % REVIEW_BADGES.length]);

const Home = () => {
  const navigate = useNavigate();
  const [typedTitle, setTypedTitle] = useState("");
  const [fakeReviews, setFakeReviews] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [stepPx, setStepPx] = useState(0);
  const [isSnapping, setIsSnapping] = useState(false);
  const viewportRef = useRef(null);
  const trackRef = useRef(null);

  useEffect(() => {
    let index = 0;
    let deleting = false;
    let timeoutId;

    const runTypingCycle = () => {
      if (!deleting && index < MAIN_TITLE.length) {
        index += 1;
        setTypedTitle(MAIN_TITLE.slice(0, index));
        timeoutId = setTimeout(runTypingCycle, TYPE_SPEED);
        return;
      }

      if (!deleting && index === MAIN_TITLE.length) {
        deleting = true;
        timeoutId = setTimeout(runTypingCycle, HOLD_AFTER_TYPED);
        return;
      }

      if (deleting && index > 0) {
        index -= 1;
        setTypedTitle(MAIN_TITLE.slice(0, index));
        timeoutId = setTimeout(runTypingCycle, DELETE_SPEED);
        return;
      }

      deleting = false;
      timeoutId = setTimeout(runTypingCycle, HOLD_AFTER_DELETED);
    };

    runTypingCycle();

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadFakeReviews = async () => {
      try {
        const response = await api.get("/ertekeles/public/fake");

        if (!mounted) return;

        const reviews = Array.isArray(response.data?.reviews)
          ? response.data.reviews
          : [];

        setFakeReviews(reviews);
        setActiveIndex(
          Math.floor(REPEAT_BLOCKS / 2) * Math.max(reviews.length, 1),
        );
      } catch {
        if (!mounted) return;
        setFakeReviews([]);
        setActiveIndex(0);
      }
    };

    loadFakeReviews();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const recalculateStep = () => {
      const track = trackRef.current;
      const firstCard = track?.querySelector(".review-polished-card");
      if (!track || !firstCard) return;

      const computed = window.getComputedStyle(track);
      const gap = Number.parseFloat(computed.columnGap || computed.gap || "0");
      const cardWidth = firstCard.getBoundingClientRect().width;
      setStepPx(cardWidth + (Number.isFinite(gap) ? gap : CARD_GAP));
    };

    const rafId = window.requestAnimationFrame(recalculateStep);
    window.addEventListener("resize", recalculateStep);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", recalculateStep);
    };
  }, [fakeReviews.length]);

  const sliderReviews = useMemo(() => {
    if (fakeReviews.length === 0) return [];

    const total = fakeReviews.length * REPEAT_BLOCKS;
    return Array.from(
      { length: total },
      (_, index) => fakeReviews[index % fakeReviews.length],
    );
  }, [fakeReviews]);

  const handleNext = () => {
    if (fakeReviews.length <= CARDS_PER_VIEW) return;
    setActiveIndex((prev) => normalizeLoopIndex(prev, fakeReviews.length) + 1);
  };

  const handlePrev = () => {
    if (fakeReviews.length <= CARDS_PER_VIEW) return;
    setActiveIndex((prev) => normalizeLoopIndex(prev, fakeReviews.length) - 1);
  };

  useEffect(() => {
    if (fakeReviews.length <= CARDS_PER_VIEW) return undefined;

    const intervalId = window.setInterval(() => {
      setActiveIndex(
        (prev) => normalizeLoopIndex(prev, fakeReviews.length) + 1,
      );
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [fakeReviews.length]);

  const handleTrackTransitionEnd = () => {
    if (fakeReviews.length <= CARDS_PER_VIEW) return;

    const normalized = normalizeLoopIndex(activeIndex, fakeReviews.length);
    if (normalized !== activeIndex) {
      setIsSnapping(true);
      setActiveIndex(normalized);
    }
  };

  useEffect(() => {
    if (!isSnapping) return;
    const rafId = window.requestAnimationFrame(() => setIsSnapping(false));
    return () => window.cancelAnimationFrame(rafId);
  }, [isSnapping]);

  const averageRating = useMemo(() => {
    if (fakeReviews.length === 0) return 0;
    const sum = fakeReviews.reduce(
      (acc, review) => acc + Number(review.stars || 0),
      0,
    );
    return sum / fakeReviews.length;
  }, [fakeReviews]);

  const roundedRating = averageRating.toFixed(1);
  const starFillPercent = Math.max(0, Math.min(100, (averageRating / 5) * 100));

  return (
    <div className="home-container">
      <header className="hero-section">
        <div className="hero-grid">
          <div className="hero-title-wrap">
            <h1 className="typing-title" aria-label={MAIN_TITLE}>
              {typedTitle}
              <span className="typing-caret" aria-hidden="true"></span>
            </h1>
          </div>

          <div className="hero-copy-wrap">
            <p className="hero-description">
              Mentoraink közül több területre specializált támogatást
              választhatsz, és számos tanulási lehetőséget biztosítunk, hogy a
              saját tempódban fejlődhess. Emellett szervereink közül is szabadon
              választhatsz kezdő, haladó és profi szinten, a céljaidhoz
              igazítva.
            </p>
            <button
              className="cta-button"
              onClick={() => navigate("/termekek")}
            >
              Bérlés indítása
            </button>
          </div>
        </div>
      </header>

      <section className="features-grid">
        <div className="feature-card">
          <h3>Gyors kiválasztás</h3>
          <p>Találd meg a számodra ideális konfigurációt percek alatt.</p>
        </div>
        <div className="feature-card">
          <h3>Biztonság</h3>
          <p>Adatvédelem és megbízható hardveres háttér minden bérléshez.</p>
        </div>
        <div className="feature-card">
          <h3>Moduláris felépítés</h3>
          <p>Rendszerünk veled együtt fejlődik, igényeidre szabva.</p>
        </div>
      </section>

      <section className="reviews-showcase" aria-label="Ügyfélvélemények">
        <div className="reviews-showcase-head">
          <span className="reviews-eyebrow">
            {"\u00dcgyf\u00e9lv\u00e9lem\u00e9nyek"}
          </span>
          <h2>
            Amit{" "}
            <span className="reviews-head-accent">{"\u0151k"} mondanak</span>{" "}
            rólunk
          </h2>
          <div className="reviews-title-divider" aria-hidden="true"></div>

          <div className="reviews-rating-row">
            <span className="reviews-rating-value">{roundedRating}</span>
            <span className="reviews-rating-stars-dynamic" aria-hidden="true">
              <span className="stars-empty">{"\u2605".repeat(5)}</span>
              <span
                className="stars-fill"
                style={{ width: `${starFillPercent}%` }}
              >
                {"\u2605".repeat(5)}
              </span>
            </span>
          </div>

          <p className="reviews-rating-caption">
            {fakeReviews.length} ellenőrzött értékelés alapján
          </p>
        </div>

        {fakeReviews.length > 0 ? (
          <div className="reviews-carousel-shell">
            <button
              type="button"
              className="reviews-nav reviews-nav-left"
              onClick={handlePrev}
              aria-label="Előző vélemények"
            >
              <span
                className="reviews-nav-chevron reviews-nav-chevron-left"
                aria-hidden="true"
              ></span>
            </button>

            <div className="reviews-viewport" ref={viewportRef}>
              <div
                ref={trackRef}
                className={`reviews-track ${isSnapping ? "no-transition" : ""}`}
                onTransitionEnd={handleTrackTransitionEnd}
                style={{
                  transform: `translate3d(-${activeIndex * stepPx}px, 0, 0)`,
                }}
              >
                {sliderReviews.map((review, index) => (
                  <article
                    className="review-polished-card"
                    key={`${review.id}-${index}`}
                  >
                    <div className="review-polished-header">
                      {review.avatarUrl ? (
                        <img
                          className="fake-review-avatar"
                          src={review.avatarUrl}
                          alt={`${review.userName} profilkép`}
                        />
                      ) : (
                        <div className="fake-review-avatar fake-review-avatar-fallback">
                          {getInitials(review.userName)}
                        </div>
                      )}

                      <div>
                        <strong>{review.userName}</strong>
                        <div className="review-polished-stars">
                          {"\u2605".repeat(5)}
                        </div>
                      </div>
                    </div>
                    <p>{review.review}</p>
                    <span className="review-meta-badge">
                      {getReviewBadge(review, index)}
                    </span>
                  </article>
                ))}
              </div>
            </div>

            <button
              type="button"
              className="reviews-nav reviews-nav-right"
              onClick={handleNext}
              aria-label="Következő vélemények"
            >
              <span
                className="reviews-nav-chevron reviews-nav-chevron-right"
                aria-hidden="true"
              ></span>
            </button>
          </div>
        ) : (
          <p className="fake-reviews-empty">
            Még nincs megjeleníthető fake review.
          </p>
        )}
      </section>
    </div>
  );
};

export default Home;
