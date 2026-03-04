import { motion } from "framer-motion";
import "../styles/Contact.css";

const Contact = () => {
  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <div className="contact-page">
      <motion.div
        className="contact-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1>Lépj kapcsolatba velünk</h1>
        <p>Kérdésed van? Szívesen segítünk!</p>
      </motion.div>

      <div className="container">
        <div className="contact-content">
          <motion.div
            className="contact-info"
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2>Elérhetőségeink</h2>
            <div className="info-item">
              <div className="info-icon">📧</div>
              <div>
                <h3>Email</h3>
                <p>info@cybernest.hu</p>
                <p>support@cybernest.hu</p>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon">📞</div>
              <div>
                <h3>Telefon</h3>
                <p>+36 1 234 5678</p>
                <p className="info-note">Hétfő-Péntek: 9:00-17:00</p>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon">📍</div>
              <div>
                <h3>Cím</h3>
                <p>1234 Budapest</p>
                <p>Példa utca 123.</p>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon">⏰</div>
              <div>
                <h3>24/7 Támogatás</h3>
                <p>Technikai segítség non-stop</p>
                <p>support@cybernest.hu</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="contact-form-container"
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2>Üzenet küldése</h2>
            <form className="contact-form">
              <div className="form-group">
                <label htmlFor="name">Név</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Add meg a neved"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="pelda@email.hu"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="subject">Tárgy</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  placeholder="Miben segíthetünk?"
                  required
                />
              </div>

              <div className="form-group">
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
                className="submit-btn"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
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
