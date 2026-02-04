import db from "../config/database.js";

class IdopontModel {
  // Időpontok lekérése eszköz ID alapján (elérhetőek)
  static async getAvailableByEszkozId(eszkoz_id) {
    const [rows] = await db.execute(
      `
      SELECT 
        id,
        atvetel_datum,
        atvetel_idopont,
        statusz
      FROM idopont
      WHERE eszkoz_id = ?
        AND statusz = 'available'
        AND atvetel_datum >= CURDATE()
      ORDER BY atvetel_datum ASC, atvetel_idopont ASC
    `,
      [eszkoz_id],
    );
    return rows;
  }

  // Időpont lekérése ID alapján
  static async findById(id) {
    const [rows] = await db.execute("SELECT * FROM idopont WHERE id = ?", [id]);
    return rows[0];
  }

  // Időpont lefoglalása
  static async reserve(id) {
    const [result] = await db.execute(
      "UPDATE idopont SET statusz = ? WHERE id = ? AND statusz = ?",
      ["reserved", id, "available"],
    );
    return result.affectedRows;
  }

  // Időpont felszabadítása (foglalás törlése)
  static async release(id) {
    const [result] = await db.execute(
      "UPDATE idopont SET statusz = ? WHERE id = ?",
      ["available", id],
    );
    return result.affectedRows;
  }

  // Új időpont létrehozása (csak admin - később)
  static async create(eszkoz_id, atvetel_datum, atvetel_idopont) {
    const [result] = await db.execute(
      "INSERT INTO idopont (eszkoz_id, atvetel_datum, atvetel_idopont, statusz) VALUES (?, ?, ?, ?)",
      [eszkoz_id, atvetel_datum, atvetel_idopont, "available"],
    );
    return result.insertId;
  }

  // Összes időpont lekérése (csak admin - később)
  static async getAll() {
    const [rows] = await db.execute(`
      SELECT 
        i.*,
        e.cpu,
        e.ram,
        e.hdd
      FROM idopont i
      JOIN eszkoz e ON i.eszkoz_id = e.id
      ORDER BY i.atvetel_datum DESC
    `);
    return rows;
  }
}

export default IdopontModel;
