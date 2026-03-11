import db from "../config/database.js";

class LogModel {
  static async getAll() {
    const [rows] = await db.execute("SELECT * FROM log ORDER BY letrehozva DESC");
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.execute("SELECT * FROM log WHERE id = ?", [id]);
    return rows[0];
  }

  static async findByFoglalasId(foglalas_id) {
    const [rows] = await db.execute(
      "SELECT * FROM log WHERE foglalas_id = ? ORDER BY letrehozva DESC",
      [foglalas_id],
    );
    return rows;
  }

  static async create(foglalas_id, uzenet) {
    const [result] = await db.execute(
      "INSERT INTO log (foglalas_id, uzenet) VALUES (?, ?)",
      [foglalas_id, uzenet],
    );
    return result.insertId;
  }

  static async update(id, uzenet) {
    const [result] = await db.execute(
      "UPDATE log SET uzenet = ? WHERE id = ?",
      [uzenet, id],
    );
    return result.affectedRows;
  }

  static async delete(id) {
    const [result] = await db.execute("DELETE FROM log WHERE id = ?", [id]);
    return result.affectedRows;
  }
}

export default LogModel;
