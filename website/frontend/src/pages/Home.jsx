import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";

const MAIN_TITLE = "CyberNest ahol nemcsak tanulhatsz";

const Home = () => {
  const navigate = useNavigate();
  const [typedTitle, setTypedTitle] = useState("");

  useEffect(() => {
    let index = 0;

    const intervalId = setInterval(() => {
      index += 1;
      setTypedTitle(MAIN_TITLE.slice(0, index));

      if (index >= MAIN_TITLE.length) {
        clearInterval(intervalId);
      }
    }, 55);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

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
              Mentoraink közül több területre specializált támogatást választhatsz,
              és számos tanulási lehetőséget biztosítunk, hogy a saját tempódban
              fejlődhess. Emellett szervereink közül is szabadon választhatsz
              kezdő, haladó és profi szinten, a céljaidhoz igazítva.
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
    </div>
  );
};

export default Home;
