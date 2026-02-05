import mysql from "mysql2/promise";
import dotenv from "dotenv";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname as pathDirname, join } from "path";

dotenv.config();

const filename = fileURLToPath(import.meta.url);
const __dirname = pathDirname(filename);

const dbHost = process.env.DB_HOST;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbName = process.env.DB_NAME;
const dbPort = Number(process.env.DB_PORT) || 3306;

const baseConfig = {
  host: dbHost,
  user: dbUser,
  password: dbPassword,
  port: dbPort,
};

// Ensure database exists before creating the pool.
try {
  const adminConnection = await mysql.createConnection(baseConfig);
  await adminConnection.query(
    `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci`,
  );
  await adminConnection.end();
} catch (error) {
  console.error("Error creating database:", error);
  throw error;
}

const db = mysql.createPool({
  ...baseConfig,
  database: dbName,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true,
});

try {
  const connection = await db.getConnection();
  console.log("Connected to the database.");

  const setupSQL = fs.readFileSync(join(__dirname, "../setup.sql"), "utf8");
  await connection.query(setupSQL);
  console.log("Database initialized successfully.");

  // Ensure default admin exists and is active
  const adminEmail = "admin@local";
  const adminHash =
    "$2b$10$svWfRA79l8Toq2ruH6f2QOTE3YwtyyGefCMt690ac4N1eJ4B.XFNW";
  await connection.query(
    `INSERT INTO felhasznalo (nev, elerhetoseg, allapot, jelszo, role)
     SELECT 'admin', ?, 'aktiv', ?, 'admin'
     WHERE NOT EXISTS (SELECT 1 FROM felhasznalo WHERE elerhetoseg = ?)`,
    [adminEmail, adminHash, adminEmail],
  );
  await connection.query(
    `UPDATE felhasznalo
     SET allapot = 'aktiv', role = 'admin', jelszo = ?
     WHERE elerhetoseg = ?`,
    [adminHash, adminEmail],
  );

  const migrations = [
    "ALTER TABLE foglalas ADD COLUMN idopont_id int(11) DEFAULT NULL",
    "ALTER TABLE foglalas ADD COLUMN berlesi_kezdete date DEFAULT NULL",
    "ALTER TABLE foglalas ADD COLUMN berlesi_vege date DEFAULT NULL",
    "ALTER TABLE foglalas ADD COLUMN statusz enum('draft','confirmed','cancelled') DEFAULT 'draft'",
    "ALTER TABLE foglalas ADD KEY idopont_id (idopont_id)",
    "ALTER TABLE foglalas ADD CONSTRAINT foglalas_ibfk_3 FOREIGN KEY (idopont_id) REFERENCES idopont (id) ON DELETE SET NULL ON UPDATE CASCADE",
  ];

  for (const sql of migrations) {
    try {
      await connection.query(sql);
    } catch (error) {
      const ignorable = [
        "ER_DUP_FIELDNAME",
        "ER_DUP_KEYNAME",
        "ER_FK_DUP_NAME",
        "ER_CANT_CREATE_TABLE",
        "ER_CANT_CREATE_TABLE",
      ];
      if (!ignorable.includes(error.code)) {
        throw error;
      }
    }
  }

  connection.release();
} catch (error) {
  console.error("Error initializing database:", error);
  throw error;
}

export default db;
