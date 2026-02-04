import db from "../config/database.js";

class UzemeltetoModel {
  // Üzemeltetők lekérése
  static async getAll() {
    const [rows] = await db.execute("SELECT * FROM uzemelteto");
    return rows;
  }

  // Üzemeltető lekérése ID alapján
  static async findById(id) {
    const [rows] = await db.execute("SELECT * FROM uzemelteto WHERE id = ?", [
      id,
    ]);
    return rows[0];
  }

  // Új üzemeltető létrehozása
  static async create(nev, leiras) {
    const [result] = await db.execute(
      "INSERT INTO uzemelteto (nev, leiras) VALUES (?, ?)",
      [nev, leiras],
    );
    return result.insertId;
  }

  // Üzemeltető frissítése
  static async update(id, nev, leiras) {
    const [result] = await db.execute(
      "UPDATE uzemelteto SET nev = ?, leiras = ? WHERE id = ?",
      [nev, leiras, id],
    );
    return result.affectedRows;
  }

  // Üzemeltető törlése
  static async delete(id) {
    const [result] = await db.execute("DELETE FROM uzemelteto WHERE id = ?", [
      id,
    ]);
    return result.affectedRows;
  }
}

export default UzemeltetoModel;
