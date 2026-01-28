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

## Backend telepítés / csomagok

```bash
npm init -y   # létrehoz egy package.json fájlt alapértelmezett beállításokkal
npm install express      # a szerver keretrendszer
npm install dotenv       # környezeti változók (pl. port)
npm install cors         # engedélyezi a fetch API hívásokat
npm install jsonwebtoken # JWT alapú auth (opcionális)
npm install bcrypt       # jelszó hasheléshez (opcionális)
```

---

## Frontend telepítés (React + Vite)

```bash
npm create vite@latest frontend # Létrehoz egy új React + Vite projektet 'my-frontend' mappába
cd frontend # Belépünk a my-frontend mappába
npm install # Telepíti a projekt függőségeit a package.json alapján
npm run dev # Elindítja a fejlesztői szervert, így a böngészőben látható lesz az alkalmazás
npm install react-router-dom
```
