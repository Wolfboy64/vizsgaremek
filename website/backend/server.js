import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './config/database.js';

// Env betöltése
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection is initialized on import

// Routes
import authRoutes from './routes/auth.js';
import eszkozRoutes from './routes/eszkoz.js';
import foglalasRoutes from './routes/foglalas.js';
import idopontRoutes from './routes/idopont.js';

app.use('/api/auth', authRoutes);
app.use('/api/eszkoz', eszkozRoutes);
app.use('/api/foglalas', foglalasRoutes);
app.use('/api/idopont', idopontRoutes);

// Debug: list users (dev only)
app.get('/api/debug/users', async (req, res) => {
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
app.get('/', async (req, res) => {
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

          <h2>Üzemeltetők</h2>
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

          <h2>Foglalások</h2>
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
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'CyberNest API is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint nem található' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Szerver hiba történt' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
