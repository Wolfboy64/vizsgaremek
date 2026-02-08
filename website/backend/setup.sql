-- CyberNest táblák automatikus létrehozása

-- Üzemeltető tábla
CREATE TABLE IF NOT EXISTS `uzemelteto` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nev` varchar(100) NOT NULL,
  `leiras` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Eszköz tábla
CREATE TABLE IF NOT EXISTS `eszkoz` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `leiras` text DEFAULT NULL,
  `cpu` varchar(100) DEFAULT NULL,
  `ram` varchar(100) DEFAULT NULL,
  `hdd` varchar(100) DEFAULT NULL,
  `uzemelteto_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `uzemelteto_id` (`uzemelteto_id`),
  CONSTRAINT `eszkoz_ibfk_1` FOREIGN KEY (`uzemelteto_id`) REFERENCES `uzemelteto` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Felhasználó tábla
CREATE TABLE IF NOT EXISTS `felhasznalo` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nev` varchar(100) NOT NULL,
  `elerhetoseg` varchar(150) DEFAULT NULL,
  `allapot` enum('aktiv','inaktiv') DEFAULT 'aktiv',
  `jelszo` varchar(255) NOT NULL,
  `role` enum('user','admin') DEFAULT 'user',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Időpont tábla
CREATE TABLE IF NOT EXISTS `idopont` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `eszkoz_id` int(11) NOT NULL,
  `atvetel_datum` date NOT NULL,
  `atvetel_idopont` time NOT NULL,
  `statusz` enum('available','reserved','completed') DEFAULT 'available',
  `letrehozva` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `eszkoz_id` (`eszkoz_id`),
  CONSTRAINT `idopont_ibfk_1` FOREIGN KEY (`eszkoz_id`) REFERENCES `eszkoz` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Foglalás tábla
CREATE TABLE IF NOT EXISTS `foglalas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `felhasznalo_id` int(11) NOT NULL,
  `eszkoz_id` int(11) NOT NULL,
  `idopont_id` int(11) DEFAULT NULL,
  `berlesi_kezdete` date DEFAULT NULL,
  `berlesi_vege` date DEFAULT NULL,
  `foglalas_datuma` datetime NOT NULL DEFAULT current_timestamp(),
  `statusz` enum('draft','confirmed','cancelled') DEFAULT 'draft',
  PRIMARY KEY (`id`),
  KEY `felhasznalo_id` (`felhasznalo_id`),
  KEY `eszkoz_id` (`eszkoz_id`),
  KEY `idopont_id` (`idopont_id`),
  CONSTRAINT `foglalas_ibfk_1` FOREIGN KEY (`felhasznalo_id`) REFERENCES `felhasznalo` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `foglalas_ibfk_2` FOREIGN KEY (`eszkoz_id`) REFERENCES `eszkoz` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `foglalas_ibfk_3` FOREIGN KEY (`idopont_id`) REFERENCES `idopont` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Értékelés tábla
CREATE TABLE IF NOT EXISTS `ertekeles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `foglalas_id` int(11) NOT NULL,
  `eszkoz_pontszam` tinyint(4) NOT NULL,
  `uzemelteto_pontszam` tinyint(4) NOT NULL,
  `megjegyzes` text DEFAULT NULL,
  `datum` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `foglalas_id` (`foglalas_id`),
  CONSTRAINT `ertekeles_ibfk_1` FOREIGN KEY (`foglalas_id`) REFERENCES `foglalas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Log tábla
CREATE TABLE IF NOT EXISTS `log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `foglalas_id` int(11) NOT NULL,
  `uzenet` text NOT NULL,
  `letrehozva` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `foglalas_id` (`foglalas_id`),
  CONSTRAINT `log_ibfk_1` FOREIGN KEY (`foglalas_id`) REFERENCES `foglalas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Demo adatok beszúrása (csak ha még nincsenek)
INSERT IGNORE INTO `uzemelteto` (`id`, `nev`, `leiras`) VALUES
(1, 'DataCenter Europe', 'Európai szintű adatközpontok hálózata'),
(2, 'CloudHost Pro', 'Professzionális cloud szolgáltató'),
(3, 'ServerFarm Inc', 'Megbízható szerver infrastruktúra');

INSERT IGNORE INTO `eszkoz` (`id`, `leiras`, `cpu`, `ram`, `hdd`, `uzemelteto_id`) VALUES
(1, 'Alapszintű VPS szerver weboldal hostinghoz', 'Intel Xeon E5-2680 v4 (4 cores)', '8 GB DDR4', '120 GB SSD', 1),
(2, 'Közepes teljesítményű dedikált szerver', 'Intel Xeon Gold 6248R (8 cores)', '32 GB DDR4', '500 GB NVMe SSD', 1),
(3, 'Nagy teljesítményű szerver adatbázisokhoz', 'AMD EPYC 7542 (16 cores)', '128 GB DDR4', '2 TB NVMe SSD RAID', 2),
(4, 'Enterprise szintű szerver', 'Intel Xeon Platinum 8280 (28 cores)', '256 GB DDR4', '4 TB NVMe SSD RAID 10', 2),
(5, 'Kezdő csomag teszteléshez', 'Intel Core i7-9700K (4 cores)', '16 GB DDR4', '240 GB SSD', 3),
(6, 'GPU-val felszerelt szerver AI projektekhez', 'AMD Ryzen 9 5950X + NVIDIA RTX 3090', '64 GB DDR4', '1 TB NVMe SSD', 3);

-- Alap admin felhasználó (admin123)
INSERT INTO `felhasznalo` (`nev`, `elerhetoseg`, `allapot`, `jelszo`, `role`)
SELECT 'admin', 'admin@local', 'aktiv', '$2b$10$mBnIrX2PjXXfLVEk5/o7iOGVPhNJcYxbVXUq9nWAHdKDizRzXDMlu', 'admin'
WHERE NOT EXISTS (
  SELECT 1 FROM `felhasznalo` WHERE `elerhetoseg` = 'admin@local'
);
