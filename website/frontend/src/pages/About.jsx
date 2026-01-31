import '../styles/About.css';

const About = () => {
  return (
    <div className="about-container">
      <h2>Küldetésünk</h2>
      <p className="intro-text">
        Projektünk célja, hogy áthidaljuk a szakadékot a komplex szervertechnológia és a felhasználóbarát ügyintézés között.
      </p>
      
      <div className="mission-content">
        <h3>Miért minket válasszon?</h3>
        <ul className="benefits-list">
          <li><strong>Átláthatóság:</strong> Nincsenek rejtett költségek.</li>
          <li><strong>Automatizáció:</strong> Kevesebb adminisztrációs hiba.</li>
          <li><strong>Megbízhatóság:</strong> Kiemelt figyelem az adatbiztonságra.</li>
        </ul>
      </div>
    </div>
  );
};

export default About;