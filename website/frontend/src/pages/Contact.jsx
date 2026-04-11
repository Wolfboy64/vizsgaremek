import { motion } from "framer-motion";
import "../styles/Contact.css";
import { FaPhone, FaMapMarkerAlt, FaHeadset, FaMailBulk } from "react-icons/fa";


const Contact = ({ embedded = false }) => {
  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <div className={`contact-page ${embedded ? "contact-page-embedded" : ""}`}>
      <motion.div
        className="contact-header reveal-on-scroll"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ "--reveal-delay": "60ms" }}
      >
        <span className="contact-eyebrow">Kapcsolat</span>
        <h1>Lépj kapcsolatba velünk</h1>
        <div className="contact-title-divider" aria-hidden="true"></div>
        <p>Kérdésed van? Szívesen segítünk!</p>
      </motion.div>

      <div className={`contact-shell ${embedded ? "contact-shell-embedded" : ""}`}>
        <div className="contact-content">
          <motion.div
            className="contact-info reveal-on-scroll"
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.2 }}
            style={{ "--reveal-delay": "120ms" }}
          >
            <h2>Elérhetőségeink</h2>
            <div className="info-item reveal-on-scroll" style={{ "--reveal-delay": "80ms" }}>
            <div className="info-icon"><FaMailBulk /></div>
            <div>
                <h3>Email</h3>
                <p>info@cybernest.hu</p>
                <p>support@cybernest.hu</p>
              </div>
            </div>

            <div className="info-item reveal-on-scroll" style={{ "--reveal-delay": "130ms" }}>
            <div className="info-icon"><FaPhone /></div>
            <div>
                <h3>Telefon</h3>
                <p>+36 1 234 5678</p>
                <p className="info-note">Hétfő-Péntek: 9:00-17:00</p>
              </div>
            </div>

            <div className="info-item reveal-on-scroll" style={{ "--reveal-delay": "180ms" }}>
            <div className="info-icon"><FaMapMarkerAlt /></div>
            <div>
                <h3>Cím</h3>
                <p>1087 Budapest</p>
                <p>Szörény utca 2-4</p>
              </div>
            </div>

            <div className="info-item reveal-on-scroll" style={{ "--reveal-delay": "230ms" }}>
            <div className="info-icon"><FaHeadset /></div>
            <div>
                <h3>24/7 Támogatás</h3>
                <p>Technikai segítség non-stop</p>
                <p>support@cybernest.hu</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="contact-form-container reveal-on-scroll"
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.2 }}
            style={{ "--reveal-delay": "180ms" }}
          >
            <h2>Üzenet küldése</h2>
            <p className="contact-form-intro">
              Írd meg röviden, miben tudunk segíteni, és visszajelzünk.
            </p>
            <form className="contact-form">
              <div className="form-group reveal-on-scroll" style={{ "--reveal-delay": "80ms" }}>
                <label htmlFor="name">Név</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Add meg a neved"
                  required
                />
              </div>

              <div className="form-group reveal-on-scroll" style={{ "--reveal-delay": "120ms" }}>
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="pelda@email.hu"
                  required
                />
              </div>

              <div className="form-group reveal-on-scroll" style={{ "--reveal-delay": "160ms" }}>
                <label htmlFor="subject">Tárgy</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  placeholder="Miben segíthetünk?"
                  required
                />
              </div>

              <div className="form-group reveal-on-scroll" style={{ "--reveal-delay": "200ms" }}>
                <label htmlFor="message">Üzenet</label>
                <textarea
                  id="message"
                  name="message"
                  rows="5"
                  placeholder="Írd le kérdésed vagy megjegyzésed..."
                  required
                ></textarea>
              </div>

              <motion.button
                type="button"
                className="submit-btn reveal-on-scroll"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{ "--reveal-delay": "260ms" }}
                onClick={(e) => {
                  e.preventDefault();
                  alert(
                    "Ez egy statikus kapcsolatfelvételi űrlap. Email küldés jelenleg nem aktív.",
                  );
                }}
              >
                Küldés
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
