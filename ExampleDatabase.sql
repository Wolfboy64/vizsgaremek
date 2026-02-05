-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Gép: 127.0.0.1
-- Létrehozás ideje: 2026. Feb 05. 13:03
-- Kiszolgáló verziója: 10.4.32-MariaDB
-- PHP verzió: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Adatbázis: `test3`
--

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `ertekeles`
--

CREATE TABLE `ertekeles` (
  `id` int(11) NOT NULL,
  `foglalas_id` int(11) NOT NULL,
  `eszkoz_pontszam` tinyint(4) NOT NULL,
  `uzemelteto_pontszam` tinyint(4) NOT NULL,
  `megjegyzes` text DEFAULT NULL,
  `datum` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `eszkoz`
--

CREATE TABLE `eszkoz` (
  `id` int(11) NOT NULL,
  `leiras` text DEFAULT NULL,
  `cpu` varchar(100) DEFAULT NULL,
  `ram` varchar(100) DEFAULT NULL,
  `hdd` varchar(100) DEFAULT NULL,
  `uzemelteto_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `eszkoz`
--

INSERT INTO `eszkoz` (`id`, `leiras`, `cpu`, `ram`, `hdd`, `uzemelteto_id`) VALUES
(17, 'Ez itt egy példa leírás, ami remekül mutatja ezen funkció gyönyöreit.', 'cpu1', 'ram1', 'hdd1', 1),
(18, 'Ez itt egy példa leírás, ami remekül mutatja ezen funkció gyönyöreit.', 'cpu2', 'ram2', 'hdd2', 1),
(19, 'Ez itt egy példa leírás, ami remekül mutatja ezen funkció gyönyöreit.', 'cpu3', 'ram3', 'hdd3', 1);

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `felhasznalo`
--

CREATE TABLE `felhasznalo` (
  `id` int(11) NOT NULL,
  `nev` varchar(100) NOT NULL,
  `elerhetoseg` varchar(150) DEFAULT NULL,
  `allapot` enum('aktiv','inaktiv') DEFAULT 'aktiv',
  `jelszo` varchar(255) NOT NULL,
  `role` enum('user','admin') DEFAULT 'user'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `felhasznalo`
--

INSERT INTO `felhasznalo` (`id`, `nev`, `elerhetoseg`, `allapot`, `jelszo`, `role`) VALUES
(2, 'Admin1', 'email', 'aktiv', 'jelszo', 'admin'),
(3, 'Admin2', 'telefon', 'aktiv', 'asd', 'admin');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `foglalas`
--

CREATE TABLE `foglalas` (
  `id` int(11) NOT NULL,
  `felhasznalo_id` int(11) NOT NULL,
  `eszkoz_id` int(11) NOT NULL,
  `foglalas_datuma` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `log`
--

CREATE TABLE `log` (
  `id` int(11) NOT NULL,
  `foglalas_id` int(11) NOT NULL,
  `uzenet` text NOT NULL,
  `letrehozva` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `uzemelteto`
--

CREATE TABLE `uzemelteto` (
  `id` int(11) NOT NULL,
  `nev` varchar(100) NOT NULL,
  `leiras` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `uzemelteto`
--

INSERT INTO `uzemelteto` (`id`, `nev`, `leiras`) VALUES
(1, 'Uzemelteto1', 'Ő egy fiktív, példa az özemeltető személyére. Biztosan nagyon okos lenne, ha létezne.');

--
-- Indexek a kiírt táblákhoz
--

--
-- A tábla indexei `ertekeles`
--
ALTER TABLE `ertekeles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `foglalas_id` (`foglalas_id`);

--
-- A tábla indexei `eszkoz`
--
ALTER TABLE `eszkoz`
  ADD PRIMARY KEY (`id`),
  ADD KEY `uzemelteto_id` (`uzemelteto_id`);

--
-- A tábla indexei `felhasznalo`
--
ALTER TABLE `felhasznalo`
  ADD PRIMARY KEY (`id`);

--
-- A tábla indexei `foglalas`
--
ALTER TABLE `foglalas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `felhasznalo_id` (`felhasznalo_id`),
  ADD KEY `eszkoz_id` (`eszkoz_id`);

--
-- A tábla indexei `log`
--
ALTER TABLE `log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `foglalas_id` (`foglalas_id`);

--
-- A tábla indexei `uzemelteto`
--
ALTER TABLE `uzemelteto`
  ADD PRIMARY KEY (`id`);

--
-- A kiírt táblák AUTO_INCREMENT értéke
--

--
-- AUTO_INCREMENT a táblához `ertekeles`
--
ALTER TABLE `ertekeles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `eszkoz`
--
ALTER TABLE `eszkoz`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT a táblához `felhasznalo`
--
ALTER TABLE `felhasznalo`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT a táblához `foglalas`
--
ALTER TABLE `foglalas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `log`
--
ALTER TABLE `log`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `uzemelteto`
--
ALTER TABLE `uzemelteto`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Megkötések a kiírt táblákhoz
--

--
-- Megkötések a táblához `ertekeles`
--
ALTER TABLE `ertekeles`
  ADD CONSTRAINT `ertekeles_ibfk_1` FOREIGN KEY (`foglalas_id`) REFERENCES `foglalas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Megkötések a táblához `eszkoz`
--
ALTER TABLE `eszkoz`
  ADD CONSTRAINT `eszkoz_ibfk_1` FOREIGN KEY (`uzemelteto_id`) REFERENCES `uzemelteto` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Megkötések a táblához `foglalas`
--
ALTER TABLE `foglalas`
  ADD CONSTRAINT `foglalas_ibfk_1` FOREIGN KEY (`felhasznalo_id`) REFERENCES `felhasznalo` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `foglalas_ibfk_2` FOREIGN KEY (`eszkoz_id`) REFERENCES `eszkoz` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Megkötések a táblához `log`
--
ALTER TABLE `log`
  ADD CONSTRAINT `log_ibfk_1` FOREIGN KEY (`foglalas_id`) REFERENCES `foglalas` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
