import '../styles/Contact.css';

const Contact = () => {
  return (
    <div className="contact-container">
      <h2>Kapcsolat</h2>
      <p>Kérdése van? Írjon nekünk bizalommal!</p>
      
      <form className="contact-form">
        <div className="form-group">
          <label>Név</label>
          <input type="text" placeholder="Az Ön neve..." />
        </div>
        <div className="form-group">
          <label>E-mail</label>
          <input type="email" placeholder="pelda@email.com" />
        </div>
        <div className="form-group">
          <label>Üzenet</label>
          <textarea rows="5" placeholder="Miben segíthetünk?"></textarea>
        </div>
        <button type="submit" className="submit-btn">Küldés</button>
      </form>
    </div>
  );
};

export default Contact;