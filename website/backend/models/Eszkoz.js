import db from "../config/database.js";

class EszkozModel {
  // Eszközök lekérése üzemeltetői információkkal
  static async getAll() {
    const [rows] = await db.execute(`
      SELECT 
        e.id, 
        e.leiras, 
        e.cpu, 
        e.ram, 
        e.hdd, 
        e.uzemelteto_id,
        u.nev as uzemelteto_nev,
        u.leiras as uzemelteto_leiras
      FROM eszkoz e
      LEFT JOIN uzemelteto u ON e.uzemelteto_id = u.id
    `);
    return rows;
  }

  // Eszkoz lekérdezése ID alapján
  static async findById(id) {
    const [rows] = await db.execute(
      `
      SELECT 
        e.id, 
        e.leiras, 
        e.cpu, 
        e.ram, 
        e.hdd, 
        e.uzemelteto_id,
        u.nev as uzemelteto_nev,
        u.leiras as uzemelteto_leiras
      FROM eszkoz e
      LEFT JOIN uzemelteto u ON e.uzemelteto_id = u.id
      WHERE e.id = ?
    `,
      [id],
    );
    return rows[0];
  }

  // Eszközök létrehozása
  static async create(leiras, cpu, ram, hdd, uzemelteto_id) {
    const [result] = await db.execute(
      "INSERT INTO eszkoz (leiras, cpu, ram, hdd, uzemelteto_id) VALUES (?, ?, ?, ?, ?)",
      [leiras, cpu, ram, hdd, uzemelteto_id],
    );
    return result.insertId;
  }

  // Eszközök frissítése
  static async update(id, leiras, cpu, ram, hdd, uzemelteto_id) {
    const [result] = await db.execute(
      "UPDATE eszkoz SET leiras = ?, cpu = ?, ram = ?, hdd = ?, uzemelteto_id = ? WHERE id = ?",
      [leiras, cpu, ram, hdd, uzemelteto_id, id],
    );
    return result.affectedRows;
  }

  // Eszközök térlése
  static async delete(id) {
    const [result] = await db.execute("DELETE FROM eszkoz WHERE id = ?", [id]);
    return result.affectedRows;
  }
}

export default EszkozModel;
