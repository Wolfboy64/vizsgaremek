import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import db from "./config/database.js";

// Env betöltése
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, ".env") });

const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = [process.env.CLIENT_URL, "http://localhost:5173"].filter(
  Boolean,
);
const corsOptions = {
  origin(origin, callback) {
    if (!origin) {
      return callback(null, true);
    }
    if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    if (process.env.NODE_ENV !== "production") {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
};

// Middleware
app.use(cors(corsOptions));
app.options("/api/{*splat}", cors(corsOptions));
app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ extended: true, limit: "30mb" }));
console.log("CLIENT_URL:", process.env.CLIENT_URL);

// Database connection is initialized on import

// Routes
import authRoutes from "./routes/auth.js";
import eszkozRoutes from "./routes/eszkoz.js";
import foglalasRoutes from "./routes/foglalas.js";
import idopontRoutes from "./routes/idopont.js";
import felhasznaloRoutes from "./routes/felhasznalo.js";
import uzemeltetoRoutes from "./routes/uzemelteto.js";
import ertekelesRoutes from "./routes/ertekeles.js";
import logRoutes from "./routes/log.js";


app.use("/api/auth", authRoutes);
app.use("/api/eszkoz", eszkozRoutes);
app.use("/api/foglalas", foglalasRoutes);
app.use("/api/idopont", idopontRoutes);
app.use("/api/felhasznalo", felhasznaloRoutes);
app.use("/api/uzemelteto", uzemeltetoRoutes);
app.use("/api/ertekeles", ertekelesRoutes);
app.use("/api/log", logRoutes);


// Debug: list users (dev only)
app.get("/api/debug/users", async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT id, nev, elerhetoseg, allapot, role FROM felhasznalo ORDER BY id ASC",
    );
    res.json(rows);
  } catch (error) {
    console.error("Hiba a debug users lekérésekor:", error);
    res.status(500).json({ message: "Szerver hiba történt." });
  }
});

// Root: basic HTML view of database contents
app.get("/", async (req, res) => {
  try {
    const [uzemeltetok] = await db.execute(
      "SELECT id, nev, leiras FROM uzemelteto ORDER BY id ASC",
    );
    const [eszkozok] = await db.execute(
      `SELECT e.id, e.leiras, e.cpu, e.ram, e.hdd, u.nev AS uzemelteto_nev
       FROM eszkoz e
       LEFT JOIN uzemelteto u ON e.uzemelteto_id = u.id
       ORDER BY e.id ASC`,
    );
    const [idopontok] = await db.execute(
      `SELECT i.id, i.eszkoz_id, i.atvetel_datum, i.atvetel_idopont, i.statusz
       FROM idopont i
       ORDER BY i.atvetel_datum ASC, i.atvetel_idopont ASC`,
    );
    const [foglalasok] = await db.execute(
      `SELECT f.id, f.felhasznalo_id, f.eszkoz_id, f.idopont_id,
              f.berlesi_kezdete, f.berlesi_vege, f.foglalas_datuma, f.statusz
       FROM foglalas f
       ORDER BY f.foglalas_datuma DESC`,
    );
    const [felhasznalok] = await db.execute(
      `SELECT id, nev, elerhetoseg, role, allapot
       FROM felhasznalo
       ORDER BY id ASC`,
    );

    const html = `
      <!doctype html>
      <html lang="hu">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>CyberNest DB</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 24px; color: #1f2937; }
            h1 { margin-bottom: 8px; }
            h2 { margin-top: 24px; }
            table { border-collapse: collapse; width: 100%; margin-top: 8px; }
            th, td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; }
            th { background: #f3f4f6; }
            .count { color: #6b7280; font-size: 0.9rem; }
          </style>
        </head>
        <body>
          <h1>CyberNest Database</h1>
          <div class="count">Összesen: ${felhasznalok.length} felhasználó, ${uzemeltetok.length} üzemeltető, ${eszkozok.length} eszköz, ${idopontok.length} időpont, ${foglalasok.length} foglalás</div>

          <h2>üzemeltetők</h2>
          <table>
            <tr><th>ID</th><th>Név</th><th>Leírás</th></tr>
            ${uzemeltetok
              .map(
                (u) =>
                  `<tr><td>${u.id}</td><td>${u.nev}</td><td>${u.leiras ?? ""}</td></tr>`,
              )
              .join("")}
          </table>

          <h2>Eszközök</h2>
          <table>
            <tr><th>ID</th><th>Leírás</th><th>CPU</th><th>RAM</th><th>HDD</th><th>Üzemeltető</th></tr>
            ${eszkozok
              .map(
                (e) =>
                  `<tr><td>${e.id}</td><td>${e.leiras ?? ""}</td><td>${e.cpu ?? ""}</td><td>${e.ram ?? ""}</td><td>${e.hdd ?? ""}</td><td>${e.uzemelteto_nev ?? ""}</td></tr>`,
              )
              .join("")}
          </table>

          <h2>Időpontok</h2>
          <table>
            <tr><th>ID</th><th>Eszköz ID</th><th>Dátum</th><th>Időpont</th><th>Státusz</th></tr>
            ${idopontok
              .map(
                (i) =>
                  `<tr><td>${i.id}</td><td>${i.eszkoz_id}</td><td>${i.atvetel_datum}</td><td>${i.atvetel_idopont}</td><td>${i.statusz}</td></tr>`,
              )
              .join("")}
          </table>

          <h2>FoglalĂˇsok</h2>
          <table>
            <tr><th>ID</th><th>Felhasználó ID</th><th>Eszköz ID</th><th>Időpont ID</th><th>Kezdete</th><th>Vége</th><th>Dátum</th><th>Státusz</th></tr>
            ${foglalasok
              .map(
                (f) =>
                  `<tr><td>${f.id}</td><td>${f.felhasznalo_id}</td><td>${f.eszkoz_id}</td><td>${f.idopont_id ?? ""}</td><td>${f.berlesi_kezdete ?? ""}</td><td>${f.berlesi_vege ?? ""}</td><td>${f.foglalas_datuma}</td><td>${f.statusz}</td></tr>`,
              )
              .join("")}
          </table>

          <h2>Felhasználók</h2>
          <table>
            <tr><th>ID</th><th>Név</th><th>Elérhetőség</th><th>Szerepkör</th><th>Állapot</th></tr>
            ${felhasznalok
              .map(
                (f) =>
                  `<tr><td>${f.id}</td><td>${f.nev}</td><td>${f.elerhetoseg ?? ""}</td><td>${f.role}</td><td>${f.allapot}</td></tr>`,
              )
              .join("")}
          </table>
        </body>
      </html>
    `;

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(html);
  } catch (error) {
    console.error("Hiba a főoldal betöltésekor:", error);
    res.status(500).send("Szerver hiba történt.");
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "CyberNest API is running" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Endpoint nem található" });
});

// Error handler
app.use((err, req, res, next) => {
  if (err?.type === "entity.too.large") {
    return res.status(413).json({
      message: "A feltöltött adat túl nagy. Maximum 20 MB képet válassz.",
    });
  }
  console.error(err.stack);
  res.status(500).json({ message: "Szerver hiba tĂ¶rtĂ©nt" });
});

// Start server
app.listen(PORT, () => {
  const oauthRequired = [
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "GOOGLE_REDIRECT_URI",
    "GITHUB_CLIENT_ID",
    "GITHUB_CLIENT_SECRET",
    "GITHUB_REDIRECT_URI",
  ];
  const missingOauth = oauthRequired.filter(
    (key) => !process.env[key] || String(process.env[key]).trim() === "",
  );

  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  if (missingOauth.length > 0) {
    console.warn("[OAuth] Missing env vars:", missingOauth.join(", "));
  } else {
    console.log("[OAuth] Google/GitHub config loaded.");
  }
});

export default app;

