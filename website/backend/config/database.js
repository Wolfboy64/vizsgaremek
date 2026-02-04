import mysql from "mysql2/promise";
import dotenv from "dotenv";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname as pathDirname, join } from "path";

dotenv.config();

const filename = fileURLToPath(import.meta.url);
const __dirname = pathDirname(filename);

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true,
});

async function initializeDatabase() {
  try {
    const connection = await db.getConnection();
    console.log("Connected to the database.");

    const setupSQL = fs.readFileSync(join(__dirname, "../setup.sql"), "utf8");
    await connection.query(setupSQL);
    console.log("Database initialized successfully.");

    connection.release();
  } catch (error) {
    console.error("Error initializing database:", error);
  }
}

initializeDatabase();

export default db;
