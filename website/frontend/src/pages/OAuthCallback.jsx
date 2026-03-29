import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Auth.css";

const OAuthCallback = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const token = params.get("token");
  const userPayload = params.get("user");
  const error = params.get("error");
  const parsedUser = useMemo(() => {
    if (!userPayload) return null;
    try {
      return JSON.parse(userPayload);
    } catch {
      return null;
    }
  }, [userPayload]);

  useEffect(() => {
    if (error || !token || !parsedUser) {
      return;
    }

    login(parsedUser, token);
    navigate("/ugyfelportal/dashboard", { replace: true });
  }, [error, token, parsedUser, login, navigate]);

  const displayError =
    error ||
    (!token || !userPayload
      ? "Hiányos OAuth válasz érkezett."
      : !parsedUser
        ? "Hibás OAuth válasz formátum."
        : "");

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>OAuth bejelentkezés</h1>
          <p>{displayError ? "Nem sikerült bejelentkezni." : "Feldolgozás..."}</p>
        </div>
        {displayError && <div className="error-message">{displayError}</div>}
      </div>
    </div>
  );
};

export default OAuthCallback;
