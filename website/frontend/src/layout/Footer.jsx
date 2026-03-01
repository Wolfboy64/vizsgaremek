import "../styles/Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <p>
            &copy; {new Date().getFullYear()} CyberNest. Minden jog fenntartva.
          </p>
          <div className="footer-links">
            <a href="#impresszum">Impresszum</a>
            <span>|</span>
            <a href="#adatkezeles">Adatkezelési tájékoztató</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
