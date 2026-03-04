# Vizsgaremek – Website - CyberNest

Ez a projekt a vizsgaremek webes része, amely egy **frontend + backend** alkalmazást tartalmaz.

---

## Kötelező tartalmi és technológiai elemek

### Backend (szerver)

- REST API létrehozása (legalább egy végpont, ami a saját adatokat adja vissza JSON-ban)
- Session vagy jogosultság kezelés (opcionális)
- Nyelvek/keretrendszerek: **Node.js + Express**
- Kód tiszta és olvasható legyen (Clean Code alapelvek)

### Frontend (web)

- Reszponzív weboldal
- HTML / CSS / JavaScript
- REST API kliensként használja a backend-et
- Adatok megjelenítése JSON alapján

---

## Amit mindenképpen kerülni kell

- Frontend nem férhet közvetlenül az adatbázishoz
- Backend és frontend ne legyen külön repo

---

## Projekt telepítés (Backend + Frontend egyszerre)

```bash
git clone <repo-url>   # Projekt klónozása
cd website             # Belépés a fő (workspace) mappába
npm install            # Telepíti a backend ÉS frontend összes csomagját egyszerre
npm run dev            # Elindítja a backend és frontend szervert egy terminálból
```
