# A project célja:

Célunk, egy olyan webes felület és asztali alkalmazás elkészítése, amely mindenki
számára könnyen érthető, és letisztult felülettel rendelkezik. Webes felületünkön
mindenki megtalálhatja a magához illő szervergép-bérlési lehetőségeket.

A projekt célja, hogy egy olyan rendszert hozzunk létre, amely egyszerűvé és átláthatóvá
teszi a fizikai szerverek bérlésének folyamatát – a gépek kiválasztásától kezdve a
foglaláson és szerződéskötésen át egészen a karbantartásig.

Fejlesztésünk során kiemelt figyelmet fordítunk a megbízhatóságra, az adatbiztonságra
és a felhasználói élményre. Szeretnénk egy olyan rendszert létrehozni, amely
hatékonyan támogatja az adminisztrációt, megkönnyíti a bérlések nyilvántartását, és
csökkenti az emberi hibák lehetőségét.

Továbbá célunk, hogy a rendszer moduláris felépítésű legyen, így a jövőben könnyen
bővíthető új funkciókkal – például automatizált jelentésekkel, statisztikákkal vagy
karbantartási ütemezéssel.


## Csapattagok névsora és feladatköre:

### Király Gellért (Frontend, Backend, Desktop, Database)

### Macza Ádám (Frontend, Backend)

### Kiss Richárd Bendegúz (Desktop)

---

## (webes rész)

Ez a repository a CyberNest vizsgaremek webes megvalósítását tartalmazza.
A rendszer egy React alapú frontendből és egy Node.js / Express backendből áll,
amely fizikai szerverekhez kapcsolódó eszköz- és foglaláskezelést valósít meg.

A cél egy egyszerűen használható, működő és később bővíthető alap rendszer létrehozása.

---

## Funkciók

### Frontend
- Oldalak: Home, About, Contact, Login, Register, Profile, Logout, Dashboard
- Bejelentkezési és regisztrációs űrlapok validációval és hibakezeléssel
- JWT alapú hitelesítés, token tárolása localStorage-ben
- Profil oldal felhasználói adatok megjelenítéséhez

### Backend (REST API)

#### Hitelesítés
- POST /api/auth/register – regisztráció
- POST /api/auth/login – bejelentkezés
- GET /api/auth/me – profil lekérése (védett)

#### Eszközkezelés (admin)
- GET /api/eszkoz – eszközök listázása
- GET /api/eszkoz/:id – eszköz részletek
- POST /api/eszkoz – új eszköz létrehozása
- PUT /api/eszkoz/:id – eszköz módosítása
- DELETE /api/eszkoz/:id – eszköz törlése

#### Foglalások
- POST /api/foglalas – foglalás létrehozása
- GET /api/foglalas/my – saját foglalások
- GET /api/foglalas – összes foglalás (admin)
- DELETE /api/foglalas/:id – foglalás törlése (admin)

#### Időpontok
- GET /api/idopont/eszkoz/:eszkoz_id – elérhető időpontok
- GET /api/idopont – összes időpont (admin)
- GET /api/idopont/:id – időpont részletek
- POST /api/idopont – időpont létrehozása
- PUT /api/idopont/:id – időpont módosítása
- DELETE /api/idopont/:id – időpont törlése

#### Egyéb
- GET /api/health – health check
- GET / – egyszerű HTML alapú adatbázis nézet (debug)
- GET /api/debug/users – felhasználók listája (debug)

---

## Adatbázis
- MySQL adatbázis
- Automatikus inicializálás setup.sql alapján
- Alap admin felhasználó létrehozása lokális környezetben

---

## Technológiák
- Frontend: React, Vite, React Router
- Backend: Node.js, Express
- Adatbázis: MySQL
- Hitelesítés: JWT

---

## Környezeti változók
- DB_HOST
- DB_USER
- DB_PASSWORD
- DB_NAME
- DB_PORT
- JWT_SECRET
- PORT
- CLIENT_URL

---

## Megjegyzés
Ez a README az aktuális állapot rövid összefoglalása.
A projekt később bővíthető részletes telepítési és használati dokumentációval.