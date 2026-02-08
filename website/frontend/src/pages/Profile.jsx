import { useAuth } from "../context/AuthContext.jsx";
import "../styles/About.css";

const Profile = () => {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <div className="about-container">
        <h1>Nincs bejelentkezve</h1>
        <p>Jelentkezz be a profil megtekintéséhez.</p>
      </div>
    );
  }

  return (
    <div className="about-container">
      <h1>Profil</h1>
      <p><strong>Név:</strong> {user.nev}</p>
      <p><strong>Elérhetőség:</strong> {user.elerhetoseg}</p>
      <p><strong>Szerepkör:</strong> {user.role}</p>
      <button onClick={logout}>Kijelentkezés</button>
    </div>
  );
};

export default Profile;
