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
const possiblePorts = [
  Number(process.env.DB_PORT) || 3306,
  3306,
  3307,
];

// Duplikációk kiszűrése
const uniquePorts = [...new Set(possiblePorts)];

let baseConfig;
let connectedPort;

for (const port of uniquePorts) {
  try {
    const testConnection = await mysql.createConnection({
      host: dbHost,
      user: dbUser,
      password: dbPassword,
      port: port,
    });

    await testConnection.end();

    baseConfig = {
      host: dbHost,
      user: dbUser,
      password: dbPassword,
      port: port,
    };

    connectedPort = port;
    console.log(`MySQL csatlakozva a ${port} porton.`);
    break;
  } catch (error) {
    console.log(`Nem sikerült csatlakozni a ${port} porton.`);
  }
}

if (!baseConfig) {
  throw new Error("Nem sikerült csatlakozni egyik MySQL portra sem (3306/3307).");
}

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
    "$2b$10$mBnIrX2PjXXfLVEk5/o7iOGVPhNJcYxbVXUq9nWAHdKDizRzXDMlu";
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
    "ALTER TABLE foglalas ADD COLUMN mentor_id varchar(64) DEFAULT NULL",
    "ALTER TABLE foglalas ADD COLUMN mentor_nev varchar(120) DEFAULT NULL",
    "ALTER TABLE foglalas ADD COLUMN ugyfel_nev varchar(120) DEFAULT NULL",
    "ALTER TABLE foglalas ADD COLUMN szamlazasi_nev varchar(120) DEFAULT NULL",
    "ALTER TABLE foglalas ADD COLUMN email varchar(150) DEFAULT NULL",
    "ALTER TABLE foglalas ADD COLUMN telefon varchar(50) DEFAULT NULL",
    "ALTER TABLE foglalas ADD COLUMN megjegyzes text DEFAULT NULL",
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
