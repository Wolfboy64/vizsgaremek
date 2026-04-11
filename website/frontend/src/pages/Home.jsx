import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import api from "../services/api";
import Products from "./Products";
import Contact from "./Contact";
import "../styles/Home.css";

const MAIN_TITLE_PREFIX = "CyberNest, ahol nemcsak";
const MAIN_TITLE_WORDS = [
  "tanulhatsz",
  "növekedhetsz",
  "fejlődhetsz",
  "építkezhetsz",
  "szintet léphetsz",
];
const TYPE_SPEED = 55;
const DELETE_SPEED = 30;
const HOLD_AFTER_TYPED = 2400;
const HOLD_AFTER_DELETED = 300;
const NAV_SCROLL_OFFSET = 88;

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
  const [typedWord, setTypedWord] = useState("");
  const [fakeReviews, setFakeReviews] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [stepPx, setStepPx] = useState(0);
  const [isSnapping, setIsSnapping] = useState(false);
  const trackRef = useRef(null);

  const scrollToSection = useCallback((sectionId) => {
    const target = document.getElementById(sectionId);
    if (!target) return;

    const top =
      target.getBoundingClientRect().top + window.scrollY - NAV_SCROLL_OFFSET;
    window.scrollTo({
      top: Math.max(top, 0),
      behavior: "smooth",
    });
  }, []);

  useEffect(() => {
    let index = 0;
    let wordIndex = 0;
    let deleting = false;
    let timeoutId;

    const runTypingCycle = () => {
      const currentWord = MAIN_TITLE_WORDS[wordIndex];

      if (!deleting && index < currentWord.length) {
        index += 1;
        setTypedWord(currentWord.slice(0, index));
        timeoutId = setTimeout(runTypingCycle, TYPE_SPEED);
        return;
      }

      if (!deleting && index === currentWord.length) {
        deleting = true;
        timeoutId = setTimeout(runTypingCycle, HOLD_AFTER_TYPED);
        return;
      }

      if (deleting && index > 0) {
        index -= 1;
        setTypedWord(currentWord.slice(0, index));
        timeoutId = setTimeout(runTypingCycle, DELETE_SPEED);
        return;
      }

      deleting = false;
      wordIndex = (wordIndex + 1) % MAIN_TITLE_WORDS.length;
      timeoutId = setTimeout(runTypingCycle, HOLD_AFTER_DELETED);
    };

    runTypingCycle();

    return () => {
      clearTimeout(timeoutId);
    };
  }, [fakeReviews.length]);

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
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      document
        .querySelectorAll(".reveal-on-scroll")
        .forEach((element) => element.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle("is-visible", entry.isIntersecting);
        });
      },
      {
        threshold: 0.14,
        rootMargin: "0px 0px -6% 0px",
      },
    );

    const registerReveals = (root) => {
      const targets = root.matches?.(".reveal-on-scroll")
        ? [root]
        : Array.from(root.querySelectorAll?.(".reveal-on-scroll") || []);

      targets.forEach((element) => observer.observe(element));
    };

    registerReveals(document);

    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType !== Node.ELEMENT_NODE) return;
          registerReveals(node);
        });
      });
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      mutationObserver.disconnect();
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const scrollFromHash = () => {
      const hash = window.location.hash.replace("#", "").trim();
      if (!hash) return;

      window.requestAnimationFrame(() => {
        scrollToSection(hash);
      });
    };

    scrollFromHash();
    window.addEventListener("hashchange", scrollFromHash);
    return () => window.removeEventListener("hashchange", scrollFromHash);
  }, [scrollToSection]);

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
      <header id="fooldal" className="hero-section onepage-section">
        <div className="hero-grid">
          <div
            className="hero-title-wrap reveal-on-scroll"
            style={{ "--reveal-delay": "120ms" }}
          >
            <h1
              className="typing-title"
              aria-label={`${MAIN_TITLE_PREFIX} ${typedWord}`}
            >
              <span className="hero-title-main">
                <span>
                  Cyber<span className="hero-title-brand">Nest</span>,
                </span>
                <br />
                <span>ahol nemcsak </span>
              </span>
              <span className="hero-title-dynamic">{typedWord}</span>
              <span className="typing-caret" aria-hidden="true"></span>
            </h1>
          </div>

          <div
            className="hero-copy-wrap reveal-on-scroll"
            style={{ "--reveal-delay": "260ms" }}
          >
            <p className="hero-description">
              Mentoraink közül több területre specializált támogatást
              választhatsz, és számos tanulási lehetőséget biztosítunk, hogy a
              saját tempódban fejlődhess. Emellett szervereink közül is szabadon
              választhatsz kezdő, haladó és profi szinten, a céljaidhoz
              igazítva.
            </p>
            <button
              className="cta-button"
              onClick={() => scrollToSection("termekek")}
            >
              Bérlés indítása
            </button>
          </div>
        </div>
      </header>

      <section id="elonyok" className="cn-features onepage-section">
        <div
          className="cn-feat reveal-on-scroll"
          style={{ "--reveal-delay": "40ms" }}
        >
          <div className="cn-feat-num">01</div>
          <div className="cn-feat-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false">
              <path d="M13 2 5 13h6l-1 9 9-12h-6l0-8Z" />
            </svg>
          </div>
          <h3>Gyors kiválasztás</h3>
          <p>
            Találd meg a számodra ideális konfigurációt percek alatt - szűrők,
            összehasonlítás, azonnali foglalás.
          </p>
        </div>
        <div
          className="cn-feat reveal-on-scroll"
          style={{ "--reveal-delay": "140ms" }}
        >
          <div className="cn-feat-num">02</div>
          <div className="cn-feat-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false">
              <rect x="5" y="10" width="14" height="10" rx="2" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" />
            </svg>
          </div>
          <h3>Biztonság</h3>
          <p>
            Adatvédelem és megbízható hardveres háttér minden bérléshez. DDoS
            védelem, titkosított kapcsolat.
          </p>
        </div>
        <div
          className="cn-feat reveal-on-scroll"
          style={{ "--reveal-delay": "240ms" }}
        >
          <div className="cn-feat-num">03</div>
          <div className="cn-feat-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="M3 10h18M9 10v9M15 10v9" />
            </svg>
          </div>
          <h3>Moduláris felépítés</h3>
          <p>
            Rendszerünk veled együtt fejlődik, igényedre szabva - skálázz
            bármikor, percek alatt.
          </p>
        </div>
      </section>

      <section id="rolunk" className="about-showcase onepage-section">
        <div
          className="about-content reveal-on-scroll"
          style={{ "--reveal-delay": "90ms" }}
        >
          <span className="about-eyebrow">Rólunk</span>
          <h2>
            CyberNest: több mint egy szerver, egy fejlődő{" "}
            <span className="about-head-accent">közösség</span>
          </h2>
          <p>
            A CyberNest nem egy online tárhelyszolgáltatás. Ez egy helyszíni
            mentorprogram, ahol személyesen, valós infrastruktúrán keresztül
            ismerheted meg a hálózatok és szerverek világát.
          </p>
          <p>
            Nálunk nem csak hozzáférést kapsz egy rendszerhez – hanem ott vagy
            mellette, megérted, hogyan működik, és közben folyamatos támogatást
            kapsz. A hangsúly a gyakorlati tanuláson és a fejlődésen van, nem az
            önálló, online “kísérletezésen”.
          </p>
          <p>
            Kezdőként lépésről lépésre vezetünk végig az alapokon egy
            biztonságos, támogató közegben. Haladóként pedig lehetőséged van
            mélyebb szintre lépni, összetettebb rendszerekkel dolgozni, és
            továbbfejlődni egy stabil, valós környezetben.
          </p>
          <div className="about-points">
            <span>Gyakorlatorientált, valós infrastruktúra</span>
            <span>Skálázható környezet tanuláshoz és projektekhez</span>
            <span>Gyors támogatás mentor szemlélettel</span>
            <span>Támogató közösség, folyamatos fejlődési fókusz</span>
          </div>
          <div className="about-actions">
            <button
              className="cta-button"
              onClick={() => scrollToSection("termekek")}
            >
              Nézd meg a szervereket
            </button>
            <button
              className="ghost-button"
              onClick={() => scrollToSection("kapcsolat")}
            >
              Beszéljünk róla
            </button>
          </div>
        </div>

        <div
          className="about-visual reveal-on-scroll"
          style={{ "--reveal-delay": "210ms" }}
          aria-hidden="true"
        >
          <div className="about-visual-glow"></div>
          <div className="about-visual-frame">
            <img
              src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80"
              alt="Modern fejlesztői környezet laptopokkal és szerveres háttérrel"
              loading="lazy"
            />
            <div className="about-visual-overlay">
              <strong>Valódi fejlődési környezet</strong>
              <span>Stabil alapokkal, gyors szakmai támogatással.</span>
            </div>
          </div>
        </div>
      </section>

      <section
        id="velemenyek"
        className="reviews-showcase onepage-section"
        aria-label="Ügyfélvélemények"
      >
        <div
          className="reviews-showcase-head reveal-on-scroll"
          style={{ "--reveal-delay": "60ms" }}
        >
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
          <div
            className="reviews-carousel-shell reveal-on-scroll"
            style={{ "--reveal-delay": "180ms" }}
          >
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

            <div className="reviews-viewport">
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

      <section id="cegeknek" className="company-focus onepage-section">
        <div
          className="company-focus-visual reveal-on-scroll"
          style={{ "--reveal-delay": "220ms" }}
          aria-hidden="true"
        >
          <div className="company-focus-visual-glow"></div>
          <div className="company-focus-visual-frame">
            <img
              src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80"
              alt="Céges csapat szakmai továbbképzésen"
              loading="lazy"
            />
            <div className="company-focus-overlay">
              <strong>Vállalati csomagok</strong>
              <span>Egyedi igényekre, valós támogatással.</span>
            </div>
          </div>
        </div>

        <div
          className="company-focus-content reveal-on-scroll"
          style={{ "--reveal-delay": "80ms" }}
        >
          <span className="company-focus-eyebrow">Cégeknek</span>
          <h2>
            Szakmai fejlődéshez és csapatképzéshez is készen áll a{" "}
            <span className="company-focus-accent">CyberNest</span>
          </h2>
          <p>
            Ha szakmai továbbképzésre, belső gyakorló környezetre vagy stabil
            szerveres háttérre van szükségetek, nálunk személyre szabott
            megoldást kaptok. Összerakjuk nektek azt a technikai csomagot,
            amellyel a csapatotok gyorsabban és biztonságosabban fejlődhet.
          </p>

          <div className="company-focus-points">
            <span>Workshopbarát infrastruktúra</span>
            <span>Skálázható környezet céges projektekhez</span>
            <span>Gyors támogatás mentor szemlélettel</span>
            <span>Kiemelt kapcsolattartó vállalati partnereknek</span>
          </div>

          <div className="company-focus-contact-card">
            <p className="company-focus-contact-title">
              Kérjen ajánlatot közvetlenül
            </p>
            <div className="company-focus-direct-row">
              <a href="mailto:info@cybernest.hu">info@cybernest.hu</a>
              <span className="company-focus-or">VAGY</span>
              <button
                className="ghost-button company-focus-inline-button"
                onClick={() => scrollToSection("kapcsolat")}
              >
                Kapcsolatfelvétel
              </button>
            </div>
          </div>
        </div>
      </section>

      <section id="termekek" className="onepage-section">
        <Products embedded />
      </section>

      <section id="mentoroknak" className="mentor-join onepage-section">
        <div
          className="mentor-join-content reveal-on-scroll"
          style={{ "--reveal-delay": "220ms" }}
        >
          <span className="mentor-join-eyebrow">Mentornak jelentkezés</span>
          <h2>
            Adj tudást, építs közösséget, és válj a{" "}
            <span className="mentor-join-accent">CyberNest mentorává</span>
          </h2>
          <p>
            Ha szívesen segítesz másoknak a fejlődésben, nálunk mentor szerepben
            valódi hatást érhetsz el. Kezdőktől haladókig támogatjuk a
            mentorainkat struktúrával, közösséggel és stabil technikai
            háttérrel.
          </p>

          <div className="mentor-join-points">
            <span>Rugalmas mentorálási időbeosztás</span>
            <span>Támogató, szakmai közösség</span>
            <span>Valós projektek, gyakorlati fejlődés</span>
            <span>Látható szakmai érték a portfóliódban</span>
          </div>

          <div className="mentor-join-contact-card">
            <p className="mentor-join-contact-title">
              Érdeklődjön nálunk bármikor
            </p>
            <div className="mentor-join-direct-row">
              <a href="mailto:info@cybernest.hu">info@cybernest.hu</a>
              <span className="mentor-join-or">VAGY</span>
              <button
                className="ghost-button mentor-join-inline-button"
                onClick={() => scrollToSection("kapcsolat")}
              >
                Kapcsolatfelvétel
              </button>
            </div>
          </div>
        </div>

        <div
          className="mentor-join-visual reveal-on-scroll"
          style={{ "--reveal-delay": "90ms" }}
          aria-hidden="true"
        >
          <div className="mentor-join-visual-orb"></div>
          <div className="mentor-join-frame">
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80"
              alt="Mentor és tanuló közös szakmai munkában"
              loading="lazy"
            />
            <div className="mentor-join-overlay">
              <strong>Mentor programok</strong>
              <span>Egyedi fejlődési útra, valós támogatással.</span>
            </div>
          </div>
        </div>
      </section>

      <section id="kapcsolat" className="onepage-section">
        <Contact embedded />
      </section>
    </div>
  );
};

export default Home;
