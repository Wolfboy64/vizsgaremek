import { useMemo, useRef, useState } from "react";
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

const MAX_IMAGE_BYTES = 20 * 1024 * 1024;

const Profile = () => {
  const { user, login } = useAuth();
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    nev: user?.nev || "",
    elerhetoseg: user?.elerhetoseg || "",
    avatarUrl: user?.avatarUrl || "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const previewAvatar = useMemo(() => {
    const value = String(formData.avatarUrl || "").trim();
    return value || null;
  }, [formData.avatarUrl]);

  const onChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
    setSuccess("");
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Csak képfájl választható profilképnek.");
      return;
    }

    if (file.size > MAX_IMAGE_BYTES) {
      setError("A profilkép túl nagy. Maximum 20 MB lehet.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      setFormData((prev) => ({ ...prev, avatarUrl: result }));
      setError("");
      setSuccess("");
    };
    reader.onerror = () => {
      setError("A kép beolvasása sikertelen volt.");
    };
    reader.readAsDataURL(file);
  };

  const clearAvatar = () => {
    setFormData((prev) => ({ ...prev, avatarUrl: "" }));
    setError("");
    setSuccess("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const nev = formData.nev.trim();
    const elerhetoseg = formData.elerhetoseg.trim().toLowerCase();
    const avatarUrl = formData.avatarUrl.trim();

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
        avatarUrl,
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
          <button
            type="button"
            className="profile-avatar-preview"
            onClick={openFilePicker}
            title="Profilkép kiválasztása"
          >
            {previewAvatar ? (
              <img
                src={previewAvatar}
                alt={formData.nev || "Profilkép"}
                referrerPolicy="no-referrer"
              />
            ) : (
              <span>{(formData.nev || "U").slice(0, 2).toUpperCase()}</span>
            )}
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="profile-file-input"
          onChange={handleFileSelected}
        />

        <div className="profile-avatar-actions">
          <button
            type="button"
            className="profile-ghost-btn"
            onClick={openFilePicker}
          >
            Profilkép kiválasztása
          </button>
          {previewAvatar && (
            <button
              type="button"
              className="profile-ghost-btn danger"
              onClick={clearAvatar}
            >
              Profilkép törlése
            </button>
          )}
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
