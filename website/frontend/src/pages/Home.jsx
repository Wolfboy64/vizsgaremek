import '../styles/Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <header className="hero-section">
        <h1>Szerverbérlés, Egyszerűen.</h1>
        <p>Megbízható fizikai szerverek, átlátható ügyintézés, profi háttér.</p>
        <button className="cta-button">Bérlés indítása</button>
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