import "../styles/Footer.css";
import {
  FaDiscord,
  FaFacebookF,
  FaGithub,
  FaInstagram,
  FaLinkedinIn,
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-brand-block">
            <h3 className="footer-brand">CyberNest</h3>
            <p>
              Stabil szervermegoldások, gyors ügyféltámogatás, skálázható
              infrastruktúra.
            </p>
            <div className="footer-socials" aria-label="Közösségi média linkek">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">
                <FaFacebookF />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
                <FaInstagram />
              </a>
              <a href="https://discord.com" target="_blank" rel="noreferrer" aria-label="Discord">
                <FaDiscord />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn">
                <FaLinkedinIn />
              </a>
              <a href="https://github.com" target="_blank" rel="noreferrer" aria-label="GitHub">
                <FaGithub />
              </a>
            </div>
          </div>

          <div className="footer-col">
            <h4>Gyors menü</h4>
            <a href="#fooldal">Főoldal</a>
            <a href="#rolunk">Rólunk</a>
            <a href="#termekek">Termékek</a>
            <a href="#kapcsolat">Kapcsolat</a>
          </div>

          <div className="footer-col">
            <h4>Kapcsolat</h4>
            <a href="mailto:info@cybernest.hu">info@cybernest.hu</a>
            <a href="mailto:support@cybernest.hu">support@cybernest.hu</a>
            <a href="tel:+3612345678">+36 1 234 5678</a>
            <span>H-P: 9:00-17:00</span>
          </div>

          <div className="footer-col">
            <h4>Jogi</h4>
            <a href="#impresszum">Impresszum</a>
            <a href="#adatkezeles">Adatkezelési tájékoztató</a>
            <a href="#aszf">ÁSZF</a>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} CyberNest. Minden jog fenntartva.</p>
          <div className="footer-bottom-links">
            <a href="#impresszum">Impresszum</a>
            <a href="#adatkezeles">Adatkezelés</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
