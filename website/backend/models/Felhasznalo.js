import db from "../config/database.js";
import bcrypt from "bcrypt";

class FelhasznaloModel {
  // Felhasználó létrehozása
  static async create(nev, elerhetoseg, jelszo, role = "user") {
    const hashedPassword = await bcrypt.hash(jelszo, 10);
    const [result] = await db.execute(
      "INSERT INTO felhasznalo (nev, elerhetoseg, jelszo, role, allapot) VALUES (?, ?, ?, ?, ?)",
      [nev, elerhetoseg, hashedPassword, role, "aktiv"],
    );
    return result.insertId;
  }

  // Felhasználó keresése elérhetőség alapján
  static async findByElerhetoseg(elerhetoseg) {
    const [rows] = await db.execute(
      "SELECT * FROM felhasznalo WHERE elerhetoseg = ?",
      [elerhetoseg],
    );
    return rows[0];
  }

  // Felhasználó keresése ID alapján
  static async findById(id) {
    const [rows] = await db.execute(
      "SELECT id, nev, elerhetoseg, allapot, role FROM felhasznalo WHERE id = ?",
      [id],
    );
    return rows[0];
  }

  // Felhasználók lekérése (csak admin)
  static async getAll() {
    const [rows] = await db.execute(
      "SELECT id, nev, elerhetoseg, allapot, role FROM felhasznalo",
    );
    return rows;
  }

  // Felhasználó frissítése
  static async update(id, nev, elerhetoseg, allapot) {
    const [result] = await db.execute(
      "UPDATE felhasznalo SET nev = ?, elerhetoseg = ?, allapot = ? WHERE id = ?",
      [nev, elerhetoseg, allapot, id],
    );
    return result.affectedRows;
  }

  // Felhasználó törlése
  static async delete(id) {
    const [result] = await db.execute("DELETE FROM felhasznalo WHERE id = ?", [
      id,
    ]);
    return result.affectedRows;
  }

  // Jelszó ellenőrzése
  static async verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}

export default FelhasznaloModel;
