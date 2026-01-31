import '../styles/Footer.css';

const Footer = () => {
  return (
    <footer className="main-footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>CyberNest</h4>
          <p>Professzionális fizikai szerver megoldások mindenkinek.</p>
        </div>
        
        <div className="footer-section">
          <h4>Linkek</h4>
          <ul>
            <li><a href="/">Főoldal</a></li>
            <li><a href="/about">Rólunk</a></li>
            <li><a href="/contact">Kapcsolat</a></li>
          </ul>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; 2024 CyberNest. Minden jog fenntartva.</p>
      </div>
    </footer>

  );
};

export default Footer;