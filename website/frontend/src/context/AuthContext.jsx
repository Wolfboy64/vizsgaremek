import { createContext, useState, useContext, useEffect } from "react";

export const AuthContext = createContext();

const API_URL = import.meta.env.VITE_API_URL || "";
const TOKEN_KEY = "cybernest_token";
const safeJsonParse = (text) => {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (error) {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY);
    if (savedToken) {
      setToken(savedToken);
      fetchProfile(savedToken);
    }
  }, []);

  const fetchProfile = async (authToken) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const text = await response.text();
      const data = safeJsonParse(text);
      if (!response.ok) {
        throw new Error(data?.message || "Token érvénytelen");
      }

      setUser(data.user || null);
    } catch (error) {
      console.error("Profil betöltési hiba:", error);
      logout();
    }
  };

  const login = async (elerhetoseg, jelszo) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ elerhetoseg, jelszo }),
      });

      const text = await response.text();
      const data = safeJsonParse(text);
      if (!response.ok) {
        throw new Error(data?.message || "Sikertelen bejelentkezés.");
      }

      localStorage.setItem(TOKEN_KEY, data.token);
      setToken(data.token);
      setUser(data.user);
      return { ok: true };
    } catch (error) {
      return { ok: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (nev, elerhetoseg, jelszo) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nev, elerhetoseg, jelszo }),
      });

      const text = await response.text();
      const data = safeJsonParse(text);
      if (!response.ok) {
        throw new Error(data?.message || "Sikertelen regisztráció.");
      }

      return { ok: true };
    } catch (error) {
      return { ok: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, register, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  return useContext(AuthContext);
}
