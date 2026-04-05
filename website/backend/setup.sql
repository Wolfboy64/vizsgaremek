-- CyberNest tĂˇblĂˇk automatikus lĂ©trehozĂˇsa

-- ĂśzemeltetĹ‘ tĂˇbla
CREATE TABLE IF NOT EXISTS `uzemelteto` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nev` varchar(100) NOT NULL,
  `leiras` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- EszkĂ¶z tĂˇbla
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

-- FelhasznĂˇlĂł tĂˇbla
CREATE TABLE IF NOT EXISTS `felhasznalo` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nev` varchar(100) NOT NULL,
  `elerhetoseg` varchar(150) DEFAULT NULL,
  `allapot` enum('aktiv','inaktiv') DEFAULT 'aktiv',
  `jelszo` varchar(255) NOT NULL,
  `role` enum('user','admin') DEFAULT 'user',
  `avatar_url` longtext NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- IdĹ‘pont tĂˇbla
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

-- FoglalĂˇs tĂˇbla
CREATE TABLE IF NOT EXISTS `foglalas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `felhasznalo_id` int(11) NOT NULL,
  `eszkoz_id` int(11) NOT NULL,
  `idopont_id` int(11) DEFAULT NULL,
  `berlesi_kezdete` date DEFAULT NULL,
  `berlesi_vege` date DEFAULT NULL,
  `mentor_id` varchar(64) DEFAULT NULL,
  `mentor_nev` varchar(120) DEFAULT NULL,
  `ugyfel_nev` varchar(120) DEFAULT NULL,
  `szamlazasi_nev` varchar(120) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `telefon` varchar(50) DEFAULT NULL,
  `megjegyzes` text DEFAULT NULL,
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

-- Ă‰rtĂ©kelĂ©s tĂˇbla
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

-- Mentor ertekeles tabla
CREATE TABLE IF NOT EXISTS `mentor_ertekeles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `foglalas_id` int(11) NOT NULL,
  `mentor_id` varchar(64) NOT NULL,
  `felhasznalo_id` int(11) NOT NULL,
  `pontszam` decimal(2,1) NOT NULL,
  `review` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_mentor_ertekeles_foglalas` (`foglalas_id`),
  KEY `idx_mentor_ertekeles_mentor` (`mentor_id`),
  KEY `idx_mentor_ertekeles_user` (`felhasznalo_id`),
  CONSTRAINT `mentor_ertekeles_ibfk_1` FOREIGN KEY (`foglalas_id`) REFERENCES `foglalas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `mentor_ertekeles_ibfk_2` FOREIGN KEY (`felhasznalo_id`) REFERENCES `felhasznalo` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Fake review tabla (csak fooldali bemutatohoz)
CREATE TABLE IF NOT EXISTS `fake_review` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_name` varchar(120) NOT NULL,
  `avatar_url` longtext NULL,
  `review` text NOT NULL,
  `stars` decimal(2,1) NOT NULL DEFAULT 5.0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
-- Log tĂˇbla
CREATE TABLE IF NOT EXISTS `log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `foglalas_id` int(11) NOT NULL,
  `uzenet` text NOT NULL,
  `letrehozva` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `foglalas_id` (`foglalas_id`),
  CONSTRAINT `log_ibfk_1` FOREIGN KEY (`foglalas_id`) REFERENCES `foglalas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Demo adatok beszĂşrĂˇsa (csak ha mĂ©g nincsenek)
INSERT IGNORE INTO `uzemelteto` (`id`, `nev`, `leiras`) VALUES
(1, 'DataCenter Europe', 'EurĂłpai szintĹ± adatkĂ¶zpontok hĂˇlĂłzata'),
(2, 'CloudHost Pro', 'ProfesszionĂˇlis cloud szolgĂˇltatĂł'),
(3, 'ServerFarm Inc', 'MegbĂ­zhatĂł szerver infrastruktĂşra');

INSERT IGNORE INTO `eszkoz` (`id`, `leiras`, `cpu`, `ram`, `hdd`, `uzemelteto_id`) VALUES
(1, 'AlapszintĹ± VPS szerver weboldal hostinghoz', 'Intel Xeon E5-2680 v4 (4 cores)', '8 GB DDR4', '120 GB SSD', 1),
(2, 'KĂ¶zepes teljesĂ­tmĂ©nyĹ± dedikĂˇlt szerver', 'Intel Xeon Gold 6248R (8 cores)', '32 GB DDR4', '500 GB NVMe SSD', 1),
(3, 'Nagy teljesĂ­tmĂ©nyĹ± szerver adatbĂˇzisokhoz', 'AMD EPYC 7542 (16 cores)', '128 GB DDR4', '2 TB NVMe SSD RAID', 2),
(4, 'Enterprise szintĹ± szerver', 'Intel Xeon Platinum 8280 (28 cores)', '256 GB DDR4', '4 TB NVMe SSD RAID 10', 2),
(5, 'KezdĹ‘ csomag tesztelĂ©shez', 'Intel Core i7-9700K (4 cores)', '16 GB DDR4', '240 GB SSD', 3),
(6, 'GPU-val felszerelt szerver AI projektekhez', 'AMD Ryzen 9 5950X + NVIDIA RTX 3090', '64 GB DDR4', '1 TB NVMe SSD', 3);

-- Jovo ideju, foglalhato idopontok feltoltese (duplikacio nelkul)
INSERT INTO `idopont` (`eszkoz_id`, `atvetel_datum`, `atvetel_idopont`, `statusz`)
SELECT
  e.id,
  DATE_ADD(CURDATE(), INTERVAL d.n DAY),
  t.atvetel_idopont,
  'available'
FROM `eszkoz` e
CROSS JOIN (
  SELECT 1 AS n UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL
  SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL SELECT 10 UNION ALL
  SELECT 11 UNION ALL SELECT 12 UNION ALL SELECT 13 UNION ALL SELECT 14
) d
CROSS JOIN (
  SELECT TIME('09:00:00') AS atvetel_idopont
  UNION ALL SELECT TIME('11:00:00')
  UNION ALL SELECT TIME('14:00:00')
  UNION ALL SELECT TIME('16:00:00')
) t
LEFT JOIN `idopont` i
  ON i.eszkoz_id = e.id
  AND i.atvetel_datum = DATE_ADD(CURDATE(), INTERVAL d.n DAY)
  AND i.atvetel_idopont = t.atvetel_idopont
WHERE i.id IS NULL;

-- Alap admin felhasznĂˇlĂł (admin123)
INSERT INTO `felhasznalo` (`nev`, `elerhetoseg`, `allapot`, `jelszo`, `role`)
SELECT 'admin', 'admin@local.com', 'aktiv', '$2b$10$mBnIrX2PjXXfLVEk5/o7iOGVPhNJcYxbVXUq9nWAHdKDizRzXDMlu', 'admin'
WHERE NOT EXISTS (
  SELECT 1 FROM `felhasznalo` WHERE `elerhetoseg` = 'admin@local.com'
);



-- Alap fake review adatok
INSERT IGNORE INTO `fake_review` (`id`, `user_name`, `avatar_url`, `review`, `stars`, `is_active`) VALUES
(1, 'Bence K.', NULL, 'Nagyon profi volt az egesz folyamat, gyorsan kaptam segitseget es minden ertheto volt.', 5.0, 1),
(2, 'Lili M.', NULL, 'A mentor nagyon segitokesz volt, biztosan jovok meg. A weboldal kezelese is egyszeru.', 5.0, 1),
(3, 'Patrik V.', NULL, 'Rugalmas idopontok, korrekt kommunikacio, abszolut pozitiv tapasztalat.', 5.0, 1),
(4, 'Zsombi R.', NULL, 'A berles es a tamogatas is flottul ment, en ezt csak ajanlani tudom.', 5.0, 1),
(5, 'Anna T.', NULL, 'Minden pontosan ugy tortent, ahogy vartam. Gyors, atlathato, megbizhato.', 5.0, 1);
