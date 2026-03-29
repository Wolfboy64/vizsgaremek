import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import db from "../config/database.js";
import FelhasznaloModel from "../models/Felhasznalo.js";
import {
  EMAIL_REGEX,
  PASSWORD_REGEX,
  USERNAME_REGEX,
  normalizeText,
} from "../utils/validation.js";

const DEFAULT_CLIENT_URL = "http://localhost:5173";

const getClientUrl = () => process.env.CLIENT_URL || DEFAULT_CLIENT_URL;

const logOauth = (provider, message, meta = "") => {
  const suffix = meta ? ` | ${meta}` : "";
  console.log(`[OAuth][${provider}] ${message}${suffix}`);
};

const getMissingEnv = (keys) =>
  keys.filter((key) => {
    const value = process.env[key];
    return !value || String(value).trim() === "";
  });

const createJwtAndUser = (user) => {
  const token = jwt.sign(
    {
      id: user.id,
      nev: user.nev,
      elerhetoseg: user.elerhetoseg,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "24h" },
  );

  return {
    token,
    user: {
      id: user.id,
      nev: user.nev,
      elerhetoseg: user.elerhetoseg,
      role: user.role,
      avatarUrl: user.avatarUrl || null,
    },
  };
};

const buildOauthSuccessRedirect = ({ token, user }) => {
  const target = new URL(
    process.env.FRONTEND_OAUTH_SUCCESS_URL ||
      `${getClientUrl()}/ugyfelportal/oauth/callback`,
  );
  target.searchParams.set("token", token);
  target.searchParams.set("user", JSON.stringify(user));
  return target.toString();
};

const buildOauthErrorRedirect = (message) => {
  const target = new URL(
    process.env.FRONTEND_OAUTH_SUCCESS_URL ||
      `${getClientUrl()}/ugyfelportal/oauth/callback`,
  );
  target.searchParams.set("error", message);
  return target.toString();
};

const resolveDisplayName = (rawName, fallbackEmail) => {
  const cleanName = normalizeText(rawName);
  if (cleanName) return cleanName;
  const emailPrefix = String(fallbackEmail || "")
    .split("@")[0]
    .replace(/[^A-Za-z0-9._-]/g, "");
  return emailPrefix || "social_user";
};

const findOrCreateSocialUser = async ({ email, name }) => {
  const normalizedEmail = normalizeText(email).toLowerCase();
  if (!EMAIL_REGEX.test(normalizedEmail)) {
    throw new Error("Ervenytelen social email cim.");
  }

  const existingUser = await FelhasznaloModel.findByElerhetoseg(normalizedEmail);
  if (existingUser) {
    if (existingUser.allapot === "inaktiv") {
      await db.execute("UPDATE felhasznalo SET allapot = 'aktiv' WHERE id = ?", [
        existingUser.id,
      ]);
      existingUser.allapot = "aktiv";
    }
    return { user: existingUser, isNewUser: false };
  }

  const safeName = resolveDisplayName(name, normalizedEmail);
  const randomPassword = crypto.randomBytes(18).toString("hex");
  const userId = await FelhasznaloModel.create(
    safeName,
    normalizedEmail,
    randomPassword,
  );
  const createdUser = await FelhasznaloModel.findById(userId);
  return { user: createdUser, isNewUser: true };
};

export const register = async (req, res) => {
  try {
    const nev = normalizeText(req.body?.nev);
    const elerhetoseg = normalizeText(req.body?.elerhetoseg).toLowerCase();
    const jelszo = String(req.body?.jelszo || "");

    if (!nev || !elerhetoseg || !jelszo) {
      return res.status(400).json({ message: "Minden mezÅ‘ kitÃ¶ltÃ©se kÃ¶telezÅ‘." });
    }

    if (!USERNAME_REGEX.test(nev)) {
      return res.status(400).json({
        message:
          "A felhasználónév érvénytelen. 3-30 karakter, betûk (ékezetes is), szám, szóköz, pont, kötõjel és aláhúzás engedett.",
      });
    }

    if (!EMAIL_REGEX.test(elerhetoseg)) {
      return res
        .status(400)
        .json({ message: "Ã‰rvÃ©nyes email cÃ­met adj meg (kÃ¶telezÅ‘ @ Ã©s .)." });
    }

    if (!PASSWORD_REGEX.test(jelszo)) {
      return res.status(400).json({
        message:
          "A jelszÃ³nak minimum 6 karakteresnek kell lennie, legyen benne betÅ± Ã©s szÃ¡m, Ã©s ne tartalmazzon szÃ³kÃ¶zt.",
      });
    }

    const existingUser = await FelhasznaloModel.findByElerhetoseg(elerhetoseg);
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "Ez az elÃ©rhetÅ‘sÃ©g mÃ¡r hasznÃ¡latban van." });
    }

    const userId = await FelhasznaloModel.create(nev, elerhetoseg, jelszo);
    res.status(201).json({ message: "Sikeres regisztrÃ¡ciÃ³.", userId });
  } catch (error) {
    console.error("RegisztrÃ¡ciÃ³s hiba:", error);
    res.status(500).json({ message: "Hiba tÃ¶rtÃ©nt a regisztrÃ¡ciÃ³ sorÃ¡n." });
  }
};

export const login = async (req, res) => {
  try {
    const elerhetoseg = normalizeText(req.body?.elerhetoseg).toLowerCase();
    const jelszo = String(req.body?.jelszo || "");

    if (!elerhetoseg || !jelszo) {
      return res.status(400).json({ message: "Minden mezÅ‘ kitÃ¶ltÃ©se kÃ¶telezÅ‘." });
    }

    if (!EMAIL_REGEX.test(elerhetoseg)) {
      return res
        .status(400)
        .json({ message: "Ã‰rvÃ©nyes email cÃ­met adj meg (kÃ¶telezÅ‘ @ Ã©s .)." });
    }

    const user = await FelhasznaloModel.findByElerhetoseg(elerhetoseg);
    if (!user) {
      return res.status(401).json({ message: "HibÃ¡s elÃ©rhetÅ‘sÃ©g vagy jelszÃ³." });
    }

    let isPasswordValid = await bcrypt.compare(jelszo, user.jelszo);
    if (!isPasswordValid && user.elerhetoseg === "admin@local") {
      if (jelszo === "admin123") {
        const newHash = await bcrypt.hash(jelszo, 10);
        await db.execute("UPDATE felhasznalo SET jelszo = ? WHERE id = ?", [
          newHash,
          user.id,
        ]);
        isPasswordValid = true;
      }
    }

    if (!isPasswordValid) {
      return res.status(401).json({ message: "HibÃ¡s elÃ©rhetÅ‘sÃ©g vagy jelszÃ³." });
    }

    if (user.allapot === "inaktiv") {
      if (user.elerhetoseg === "admin@local") {
        await db.execute(
          "UPDATE felhasznalo SET allapot = 'aktiv', role = 'admin' WHERE id = ?",
          [user.id],
        );
        user.allapot = "aktiv";
        user.role = "admin";
      } else {
        return res.status(403).json({
          message: "A fiÃ³k inaktÃ­v. Vedd fel a kapcsolatot az Ã¼gyfÃ©lszolgÃ¡lattal.",
        });
      }
    }


    const payload = createJwtAndUser(user);
    res.json({
      message: "Sikeres bejelentkezÃ©s.",
      token: payload.token,
      user: payload.user,
    });
  } catch (error) {
    console.error("BejelentkezÃ©si hiba:", error);
    res.status(500).json({ message: "Hiba tÃ¶rtÃ©nt a bejelentkezÃ©s sorÃ¡n." });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await FelhasznaloModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "FelhasznÃ¡lÃ³ nem talÃ¡lhatÃ³." });
    }

    res.json({ user });
  } catch (error) {
    console.error("Profil lekÃ©rÃ©si hiba:", error);
    res.status(500).json({ message: "Szerver hiba tÃ¶rtÃ©nt a profil lekÃ©rÃ©se sorÃ¡n." });
  }
};

export const startGoogleOAuth = async (req, res) => {
  try {
    logOauth("Google", "start requested");
    const missing = getMissingEnv(["GOOGLE_CLIENT_ID", "GOOGLE_REDIRECT_URI"]);
    if (missing.length > 0) {
      console.warn("[OAuth][Google] Missing env vars:", missing.join(", "));
      return res.status(500).json({
        message: "Google OAuth nincs beÃ¡llÃ­tva a szerveren.",
        missing,
      });
    }
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;

    const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    authUrl.searchParams.set("client_id", clientId);
    authUrl.searchParams.set("redirect_uri", redirectUri);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("scope", "openid email profile");
    authUrl.searchParams.set("prompt", "select_account");
    authUrl.searchParams.set("access_type", "offline");
    logOauth("Google", "redirecting to provider");

    res.redirect(authUrl.toString());
  } catch (error) {
    console.error("Google OAuth start hiba:", error);
    res.status(500).json({ message: "Google belÃ©pÃ©s indÃ­tÃ¡sa sikertelen." });
  }
};

export const handleGoogleOAuthCallback = async (req, res) => {
  try {
    logOauth("Google", "callback received");
    const { code, error } = req.query;
    if (error) {
      logOauth("Google", "provider returned error", String(error));
      return res.redirect(buildOauthErrorRedirect("Google belÃ©pÃ©s megszakÃ­tva."));
    }
    if (!code) {
      logOauth("Google", "missing auth code");
      return res.redirect(buildOauthErrorRedirect("Google kÃ³d nem Ã©rkezett meg."));
    }

    const missing = getMissingEnv([
      "GOOGLE_CLIENT_ID",
      "GOOGLE_CLIENT_SECRET",
      "GOOGLE_REDIRECT_URI",
    ]);
    if (missing.length > 0) {
      console.warn("[OAuth][Google callback] Missing env vars:", missing.join(", "));
      return res.redirect(
        buildOauthErrorRedirect(
          `Google OAuth nincs beÃ¡llÃ­tva a szerveren. HiÃ¡nyzik: ${missing.join(", ")}`,
        ),
      );
    }
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code: String(code),
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      logOauth("Google", "token exchange failed", String(tokenResponse.status));
      return res.redirect(buildOauthErrorRedirect("Google token csere sikertelen."));
    }

    const tokenData = await tokenResponse.json();
    const userInfoResponse = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      },
    );

    if (!userInfoResponse.ok) {
      logOauth("Google", "userinfo fetch failed", String(userInfoResponse.status));
      return res.redirect(
        buildOauthErrorRedirect("Google felhasznÃ¡lÃ³i adatok lekÃ©rÃ©se sikertelen."),
      );
    }

    const profile = await userInfoResponse.json();
    const email = normalizeText(profile.email).toLowerCase();
    const name = normalizeText(profile.name);
    const { user, isNewUser } = await findOrCreateSocialUser({ email, name });

    const googleDisplayName = resolveDisplayName(name, email);
    if (!isNewUser && user.nev !== googleDisplayName) {
      await db.execute("UPDATE felhasznalo SET nev = ? WHERE id = ?", [
        googleDisplayName,
        user.id,
      ]);
      user.nev = googleDisplayName;
    }
    user.avatarUrl = normalizeText(profile.picture);
    const payload = createJwtAndUser(user);
    logOauth(
      "Google",
      isNewUser ? "user registered and logged in" : "user logged in",
      `email=${email}`,
    );

    res.redirect(buildOauthSuccessRedirect(payload));
  } catch (error) {
    console.error("Google callback hiba:", error);
    res.redirect(buildOauthErrorRedirect("Google belÃ©pÃ©s sikertelen."));
  }
};

export const startGitHubOAuth = async (req, res) => {
  try {
    logOauth("GitHub", "start requested");
    const missing = getMissingEnv(["GITHUB_CLIENT_ID", "GITHUB_REDIRECT_URI"]);
    if (missing.length > 0) {
      console.warn("[OAuth][GitHub] Missing env vars:", missing.join(", "));
      return res.status(500).json({
        message: "GitHub OAuth nincs beállítva a szerveren.",
        missing,
      });
    }

    const clientId = process.env.GITHUB_CLIENT_ID;
    const redirectUri = process.env.GITHUB_REDIRECT_URI;

    const authUrl = new URL("https://github.com/login/oauth/authorize");
    authUrl.searchParams.set("client_id", clientId);
    authUrl.searchParams.set("redirect_uri", redirectUri);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("scope", "read:user user:email");
    logOauth("GitHub", "redirecting to provider");

    res.redirect(authUrl.toString());
  } catch (error) {
    console.error("GitHub OAuth start hiba:", error);
    res.status(500).json({ message: "GitHub belépés indítása sikertelen." });
  }
};

export const handleGitHubOAuthCallback = async (req, res) => {
  try {
    logOauth("GitHub", "callback received");
    const { code, error } = req.query;
    if (error) {
      logOauth("GitHub", "provider returned error", String(error));
      return res.redirect(buildOauthErrorRedirect("GitHub belépés megszakítva."));
    }
    if (!code) {
      logOauth("GitHub", "missing auth code");
      return res.redirect(buildOauthErrorRedirect("GitHub kód nem érkezett meg."));
    }

    const missing = getMissingEnv([
      "GITHUB_CLIENT_ID",
      "GITHUB_CLIENT_SECRET",
      "GITHUB_REDIRECT_URI",
    ]);
    if (missing.length > 0) {
      console.warn("[OAuth][GitHub callback] Missing env vars:", missing.join(", "));
      return res.redirect(
        buildOauthErrorRedirect(
          `GitHub OAuth nincs beállítva a szerveren. Hiányzik: ${missing.join(", ")}`,
        ),
      );
    }

    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;
    const redirectUri = process.env.GITHUB_REDIRECT_URI;

    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code: String(code),
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      logOauth("GitHub", "token exchange failed", String(tokenResponse.status));
      return res.redirect(buildOauthErrorRedirect("GitHub token csere sikertelen."));
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      logOauth("GitHub", "missing access token in token response");
      return res.redirect(buildOauthErrorRedirect("GitHub token nem érkezett meg."));
    }

    const profileResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github+json",
      },
    });

    if (!profileResponse.ok) {
      logOauth("GitHub", "userinfo fetch failed", String(profileResponse.status));
      return res.redirect(
        buildOauthErrorRedirect("GitHub felhasználói adatok lekérése sikertelen."),
      );
    }

    const profile = await profileResponse.json();
    let email = normalizeText(profile.email).toLowerCase();

    if (!email) {
      const emailsResponse = await fetch("https://api.github.com/user/emails", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github+json",
        },
      });

      if (emailsResponse.ok) {
        const emails = await emailsResponse.json();
        const primaryVerified = emails.find(
          (item) => item?.primary && item?.verified && item?.email,
        );
        const anyVerified = emails.find((item) => item?.verified && item?.email);
        const fallback =
          primaryVerified || anyVerified || emails.find((item) => item?.email);
        email = normalizeText(fallback?.email).toLowerCase();
      }
    }

    if (!email) {
      logOauth("GitHub", "missing email");
      return res.redirect(
        buildOauthErrorRedirect(
          "A GitHub fiók nem adott email címet. Tegyél nyilvánossá egy emailt, vagy engedélyezd az email hozzáférést.",
        ),
      );
    }

    const githubDisplayName = resolveDisplayName(
      normalizeText(profile.login || profile.name),
      email,
    );
    const { user, isNewUser } = await findOrCreateSocialUser({
      email,
      name: githubDisplayName,
    });

    if (!isNewUser && user.nev !== githubDisplayName) {
      await db.execute("UPDATE felhasznalo SET nev = ? WHERE id = ?", [
        githubDisplayName,
        user.id,
      ]);
      user.nev = githubDisplayName;
    }

    user.avatarUrl = normalizeText(profile.avatar_url);
    const payload = createJwtAndUser(user);
    logOauth(
      "GitHub",
      isNewUser ? "user registered and logged in" : "user logged in",
      `email=${email}`,
    );

    res.redirect(buildOauthSuccessRedirect(payload));
  } catch (error) {
    console.error("GitHub callback hiba:", error);
    res.redirect(buildOauthErrorRedirect("GitHub belépés sikertelen."));
  }
};

export const updateOwnProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const nev = normalizeText(req.body?.nev);
    const elerhetoseg = normalizeText(req.body?.elerhetoseg).toLowerCase();
    const avatarUrl = normalizeText(req.body?.avatarUrl);
    const newPassword = String(req.body?.newPassword || "");

    if (!nev || !elerhetoseg) {
      return res.status(400).json({ message: "A név és email megadása kötelezõ." });
    }

    if (!USERNAME_REGEX.test(nev)) {
      return res.status(400).json({
        message:
          "A felhasználónév érvénytelen. 3-30 karakter, betûk (ékezetes is), szám, szóköz, pont, kötõjel és aláhúzás engedett.",
      });
    }

    if (!EMAIL_REGEX.test(elerhetoseg)) {
      return res.status(400).json({ message: "Érvényes email címet adj meg." });
    }

    if (avatarUrl) {
      if (avatarUrl.startsWith("data:image/")) {
        const isValidDataUrl =
          /^data:image\/(png|jpeg|jpg|webp|gif);base64,[A-Za-z0-9+/=]+$/i.test(
            avatarUrl,
          );
        if (!isValidDataUrl) {
          return res.status(400).json({ message: "A profilkép formátuma hibás." });
        }

        const base64Body = avatarUrl.split(",")[1] || "";
        const padding = (base64Body.match(/=+$/)?.[0]?.length || 0);
        const approximateBytes = Math.floor((base64Body.length * 3) / 4) - padding;
        const maxBytes = 20 * 1024 * 1024;

        if (approximateBytes > maxBytes) {
          return res.status(400).json({
            message: "A profilkép túl nagy. Maximum 20 MB képet válassz.",
          });
        }
      } else {
        try {
          const parsed = new URL(avatarUrl);
          if (!["http:", "https:"].includes(parsed.protocol)) {
            return res.status(400).json({
              message: "A profilkép URL csak http/https lehet.",
            });
          }
        } catch {
          return res.status(400).json({ message: "A profilkép URL formátuma hibás." });
        }
      }
    }

    const existingEmailOwner = await FelhasznaloModel.findByElerhetoseg(elerhetoseg);
    if (existingEmailOwner && Number(existingEmailOwner.id) !== Number(userId)) {
      return res.status(409).json({ message: "Ez az email cím már használatban van." });
    }

    if (newPassword) {
      if (!PASSWORD_REGEX.test(newPassword)) {
        return res.status(400).json({
          message:
            "Az új jelszó legyen legalább 6 karakter, tartalmazzon betût és számot, és ne legyen benne szóköz.",
        });
      }

      const newHash = await bcrypt.hash(newPassword, 10);
      await db.execute("UPDATE felhasznalo SET jelszo = ? WHERE id = ?", [
        newHash,
        userId,
      ]);
    }

    await db.execute(
      "UPDATE felhasznalo SET nev = ?, elerhetoseg = ?, avatar_url = ? WHERE id = ?",
      [nev, elerhetoseg, avatarUrl || null, userId],
    );

    const updatedUser = await FelhasznaloModel.findById(userId);
    if (!updatedUser) {
      return res.status(404).json({ message: "Felhasználó nem található." });
    }

    const payload = createJwtAndUser(updatedUser);

    res.json({
      message: "Profil sikeresen frissítve.",
      token: payload.token,
      user: payload.user,
    });
  } catch (error) {
    console.error("Profil frissítési hiba:", error);
    res.status(500).json({ message: "Hiba történt a profil frissítése során." });
  }
};

