import db from '../config/database.js';

class IdopontModel {
  // Get available pickup times for a device
  static async getAvailableByEszkozId(eszkoz_id) {
    const [rows] = await db.execute(`
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
    `, [eszkoz_id]);
    return rows;
  }

  // Get time slot by ID
  static async findById(id) {
    const [rows] = await db.execute(
      'SELECT * FROM idopont WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  // Reserve a pickup time slot
  static async reserve(id) {
    const [result] = await db.execute(
      'UPDATE idopont SET statusz = ? WHERE id = ? AND statusz = ?',
      ['reserved', id, 'available']
    );
    return result.affectedRows;
  }

  // Release a pickup time slot (cancel reservation)
  static async release(id) {
    const [result] = await db.execute(
      'UPDATE idopont SET statusz = ? WHERE id = ?',
      ['available', id]
    );
    return result.affectedRows;
  }

  // Create new pickup time (admin only - later)
  static async create(eszkoz_id, atvetel_datum, atvetel_idopont) {
    const [result] = await db.execute(
      'INSERT INTO idopont (eszkoz_id, atvetel_datum, atvetel_idopont, statusz) VALUES (?, ?, ?, ?)',
      [eszkoz_id, atvetel_datum, atvetel_idopont, 'available']
    );
    return result.insertId;
  }

  // Get all pickup times (admin only - later)
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