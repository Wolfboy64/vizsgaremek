import db from "../config/database.js";

class ErtekelesModel {
  static async getAll() {
    const [rows] = await db.execute(
      "SELECT * FROM ertekeles ORDER BY datum DESC",
    );
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.execute(
      "SELECT * FROM ertekeles WHERE id = ?",
      [id],
    );
    return rows[0];
  }

  static async findByFoglalasId(foglalas_id) {
    const [rows] = await db.execute(
      "SELECT * FROM ertekeles WHERE foglalas_id = ?",
      [foglalas_id],
    );
    return rows[0];
  }

  static async create(foglalas_id, eszkoz_pontszam, uzemelteto_pontszam, megjegyzes) {
    const [result] = await db.execute(
      "INSERT INTO ertekeles (foglalas_id, eszkoz_pontszam, uzemelteto_pontszam, megjegyzes) VALUES (?, ?, ?, ?)",
      [foglalas_id, eszkoz_pontszam, uzemelteto_pontszam, megjegyzes],
    );
    return result.insertId;
  }

  static async update(id, eszkoz_pontszam, uzemelteto_pontszam, megjegyzes) {
    const [result] = await db.execute(
      "UPDATE ertekeles SET eszkoz_pontszam = ?, uzemelteto_pontszam = ?, megjegyzes = ? WHERE id = ?",
      [eszkoz_pontszam, uzemelteto_pontszam, megjegyzes, id],
    );
    return result.affectedRows;
  }

  static async delete(id) {
    const [result] = await db.execute(
      "DELETE FROM ertekeles WHERE id = ?",
      [id],
    );
    return result.affectedRows;
  }
}

export default ErtekelesModel;
