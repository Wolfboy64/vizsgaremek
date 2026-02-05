-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Gép: 127.0.0.1
-- Létrehozás ideje: 2026. Feb 01. 16:23
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
(1, 'Alapszintű VPS szerver weboldal hostinghoz', 'Intel Xeon E5-2680 v4 (4 cores)', '8 GB DDR4', '120 GB SSD', 1),
(2, 'Közepes teljesítményű dedikált szerver', 'Intel Xeon Gold 6248R (8 cores)', '32 GB DDR4', '500 GB NVMe SSD', 1),
(3, 'Nagy teljesítményű szerver adatbázisokhoz', 'AMD EPYC 7542 (16 cores)', '128 GB DDR4', '2 TB NVMe SSD RAID', 2),
(4, 'Enterprise szintű szerver', 'Intel Xeon Platinum 8280 (28 cores)', '256 GB DDR4', '4 TB NVMe SSD RAID 10', 2),
(5, 'Kezdő csomag teszteléshez', 'Intel Core i7-9700K (4 cores)', '16 GB DDR4', '240 GB SSD', 3),
(6, 'GPU-val felszerelt szerver AI projektekhez', 'AMD Ryzen 9 5950X + NVIDIA RTX 3090', '64 GB DDR4', '1 TB NVMe SSD', 3);

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
(1, 'admin', 'email', 'inaktiv', 'admin', 'admin'),
(2, 'asd', 'asd', 'aktiv', '$2b$10$zHRxt90itJnaHFuNAi7hT.qFwQhhmxF7PDErX2em4LctWkwbiN4pq', 'user'),
(3, 'kuki', 'kukimail', 'aktiv', '$2b$10$BuhoVGdAKlol2FKGoaj6X.ISdT.FDIAjdFXqvLg65pC22z8c6wI2u', 'user');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `foglalas`
--

CREATE TABLE `foglalas` (
  `id` int(11) NOT NULL,
  `felhasznalo_id` int(11) NOT NULL,
  `eszkoz_id` int(11) NOT NULL,
  `idopont_id` int(11) DEFAULT NULL,
  `berlesi_kezdete` date DEFAULT NULL,
  `berlesi_vege` date DEFAULT NULL,
  `foglalas_datuma` datetime NOT NULL DEFAULT current_timestamp(),
  `statusz` enum('draft','confirmed','cancelled') DEFAULT 'draft'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `foglalas`
--

INSERT INTO `foglalas` (`id`, `felhasznalo_id`, `eszkoz_id`, `idopont_id`, `berlesi_kezdete`, `berlesi_vege`, `foglalas_datuma`, `statusz`) VALUES
(8, 3, 1, NULL, NULL, NULL, '2026-01-31 17:01:50', 'confirmed'),
(10, 3, 2, NULL, NULL, NULL, '2026-01-31 17:12:53', 'confirmed'),
(11, 3, 2, 4, NULL, NULL, '2026-01-31 22:06:24', 'confirmed'),
(12, 3, 3, 7, NULL, NULL, '2026-01-31 22:06:59', 'confirmed'),
(15, 3, 2, 17, '2026-02-05', '2026-03-06', '2026-01-31 22:23:56', 'confirmed'),
(16, 3, 1, 15, '2026-02-06', '2026-03-06', '2026-01-31 22:24:52', 'confirmed'),
(17, 3, 2, 16, '2026-02-05', '2026-03-07', '2026-01-31 22:28:04', 'confirmed'),
(18, 3, 2, 18, '2026-02-06', '2026-02-19', '2026-02-01 16:18:20', 'confirmed');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `idopont`
--

CREATE TABLE `idopont` (
  `id` int(11) NOT NULL,
  `eszkoz_id` int(11) NOT NULL,
  `atvetel_datum` date NOT NULL,
  `atvetel_idopont` time NOT NULL,
  `statusz` enum('available','reserved','completed') DEFAULT 'available',
  `letrehozva` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `idopont`
--

INSERT INTO `idopont` (`id`, `eszkoz_id`, `atvetel_datum`, `atvetel_idopont`, `statusz`, `letrehozva`) VALUES
(1, 1, '2026-02-01', '09:00:00', 'available', '2026-01-31 17:04:47'),
(2, 1, '2026-02-08', '09:00:00', 'available', '2026-01-31 17:04:47'),
(3, 1, '2026-02-15', '09:00:00', 'available', '2026-01-31 17:04:47'),
(4, 2, '2026-02-03', '10:00:00', 'reserved', '2026-01-31 17:04:47'),
(5, 2, '2026-02-11', '10:00:00', 'reserved', '2026-01-31 17:04:47'),
(6, 3, '2026-02-05', '14:00:00', 'available', '2026-01-31 17:04:47'),
(7, 3, '2026-02-13', '14:00:00', 'reserved', '2026-01-31 17:04:47'),
(8, 4, '2026-02-01', '08:00:00', 'available', '2026-01-31 17:04:47'),
(9, 5, '2026-02-10', '11:00:00', 'available', '2026-01-31 17:04:47'),
(10, 6, '2026-02-01', '13:00:00', 'available', '2026-01-31 17:04:47'),
(11, 1, '2026-02-03', '09:00:00', 'available', '2026-01-31 22:14:12'),
(12, 1, '2026-02-03', '14:00:00', 'available', '2026-01-31 22:14:12'),
(13, 1, '2026-02-04', '10:00:00', 'available', '2026-01-31 22:14:12'),
(14, 1, '2026-02-05', '11:00:00', 'available', '2026-01-31 22:14:12'),
(15, 1, '2026-02-06', '09:00:00', 'reserved', '2026-01-31 22:14:12'),
(16, 2, '2026-02-03', '10:00:00', 'reserved', '2026-01-31 22:14:12'),
(17, 2, '2026-02-04', '15:00:00', 'reserved', '2026-01-31 22:14:12'),
(18, 2, '2026-02-05', '09:00:00', 'reserved', '2026-01-31 22:14:12'),
(19, 2, '2026-02-06', '13:00:00', 'reserved', '2026-01-31 22:14:12'),
(20, 3, '2026-02-04', '14:00:00', 'available', '2026-01-31 22:14:12'),
(21, 3, '2026-02-05', '10:00:00', 'available', '2026-01-31 22:14:12'),
(22, 3, '2026-02-06', '11:00:00', 'available', '2026-01-31 22:14:12'),
(23, 4, '2026-02-03', '08:00:00', 'available', '2026-01-31 22:14:12'),
(24, 4, '2026-02-05', '16:00:00', 'available', '2026-01-31 22:14:12'),
(25, 5, '2026-02-04', '11:00:00', 'available', '2026-01-31 22:14:12'),
(26, 5, '2026-02-06', '14:00:00', 'available', '2026-01-31 22:14:12'),
(27, 6, '2026-02-03', '13:00:00', 'available', '2026-01-31 22:14:12'),
(28, 6, '2026-02-05', '15:00:00', 'available', '2026-01-31 22:14:12');

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
(1, 'DataCenter Europe', 'Európai szintű adatközpontok hálózata'),
(2, 'CloudHost Pro', 'Professzionális cloud szolgáltató'),
(3, 'ServerFarm Inc', 'Megbízható szerver infrastruktúra');

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
  ADD KEY `eszkoz_id` (`eszkoz_id`),
  ADD KEY `idopont_id` (`idopont_id`);

--
-- A tábla indexei `idopont`
--
ALTER TABLE `idopont`
  ADD PRIMARY KEY (`id`),
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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT a táblához `felhasznalo`
--
ALTER TABLE `felhasznalo`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT a táblához `foglalas`
--
ALTER TABLE `foglalas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT a táblához `idopont`
--
ALTER TABLE `idopont`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT a táblához `log`
--
ALTER TABLE `log`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `uzemelteto`
--
ALTER TABLE `uzemelteto`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

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
  ADD CONSTRAINT `foglalas_ibfk_2` FOREIGN KEY (`eszkoz_id`) REFERENCES `eszkoz` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `foglalas_ibfk_3` FOREIGN KEY (`idopont_id`) REFERENCES `idopont` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Megkötések a táblához `idopont`
--
ALTER TABLE `idopont`
  ADD CONSTRAINT `idopont_ibfk_1` FOREIGN KEY (`eszkoz_id`) REFERENCES `eszkoz` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Megkötések a táblához `log`
--
ALTER TABLE `log`
  ADD CONSTRAINT `log_ibfk_1` FOREIGN KEY (`foglalas_id`) REFERENCES `foglalas` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
