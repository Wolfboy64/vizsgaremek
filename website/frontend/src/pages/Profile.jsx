import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "../styles/Profile.css";
import {
  isValidEmail,
  isValidPassword,
  isValidUsername,
} from "../utils/validation";

const MotionDiv = motion.div;
const MotionButton = motion.button;

const Profile = () => {
  const { user, login } = useAuth();
  const [formData, setFormData] = useState({
    nev: user?.nev || "",
    elerhetoseg: user?.elerhetoseg || "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const previewAvatar = useMemo(() => {
    const value = String(user?.avatarUrl || "").trim();
    return value || null;
  }, [user?.avatarUrl]);

  const onChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const nev = formData.nev.trim();
    const elerhetoseg = formData.elerhetoseg.trim().toLowerCase();

    if (!isValidUsername(nev)) {
      setError(
       "A felhasználóneved érvénytelen. 3-30 karakter, betűk (kis- és nagybetű), szám, szóköz, pont, kötőjel és aláhúzás engedett.",
      );
      return;
    }

    if (!isValidEmail(elerhetoseg)) {
      setError("Adj meg egy érvényes email címet.");
      return;
    }

    if (formData.newPassword) {
      if (!isValidPassword(formData.newPassword)) {
        setError(
          "Az új jelszó legalább 6 karakter legyen, tartalmazzon betűt és számot.",
        );
        return;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        setError("Az új jelszavak nem egyeznek.");
        return;
      }
    }

    setLoading(true);

    try {
      const response = await api.put("/auth/me", {
        nev,
        elerhetoseg,
        newPassword: formData.newPassword,
      });

      login(response.data.user, response.data.token);
      setFormData((prev) => ({
        ...prev,
        newPassword: "",
        confirmPassword: "",
      }));
      setSuccess("Profil sikeresen frissítve.");
    } catch (err) {
      setError(
        err.response?.data?.message || "Hiba történt a profil mentésekor.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page">
      <MotionDiv
        className="profile-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <h1>Profil</h1>
        <p>Itt szerkesztheted a személyes adataidat és jelszavadat.</p>
      </MotionDiv>

      <MotionDiv
        className="profile-card"
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {error && (
          <div className="profile-alert profile-alert-error">{error}</div>
        )}
        {success && (
          <div className="profile-alert profile-alert-success">{success}</div>
        )}

        <div className="profile-avatar-preview-wrap">
          <div className="profile-avatar-preview" aria-hidden="true">
            {previewAvatar ? (
              <img
                src={previewAvatar}
                alt={formData.nev || "Profilkép"}
                referrerPolicy="no-referrer"
              />
            ) : (
              <span>{(formData.nev || "U").slice(0, 2).toUpperCase()}</span>
            )}
          </div>
        </div>

        <form className="profile-form" onSubmit={handleSubmit} noValidate>
          <div className="profile-grid">
            <div className="form-group">
              <label htmlFor="nev">Felhasználónév</label>
              <input
                id="nev"
                name="nev"
                value={formData.nev}
                onChange={onChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="elerhetoseg">Email cím</label>
              <input
                id="elerhetoseg"
                name="elerhetoseg"
                value={formData.elerhetoseg}
                onChange={onChange}
                required
              />
            </div>
          </div>

          <div className="profile-divider">Jelszó módosítása</div>

          <div className="profile-grid">
            <div className="form-group">
              <label htmlFor="newPassword">Új jelszó</label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={onChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Új jelszó megerősítése</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={onChange}
              />
            </div>
          </div>

          <MotionButton
            type="submit"
            className="profile-save-btn"
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.01 }}
            whileTap={{ scale: loading ? 1 : 0.99 }}
          >
            {loading ? "Mentés..." : "Profil mentése"}
          </MotionButton>
        </form>
      </MotionDiv>
    </div>
  );
};

export default Profile;
