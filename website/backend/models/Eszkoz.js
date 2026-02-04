import db from '../config/database.js';

class EszkozModel {
  // Get all devices with operator info
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

  // Get device by ID
  static async findById(id) {
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
      WHERE e.id = ?
    `, [id]);
    return rows[0];
  }

  // Create new device
  static async create(leiras, cpu, ram, hdd, uzemelteto_id) {
    const [result] = await db.execute(
      'INSERT INTO eszkoz (leiras, cpu, ram, hdd, uzemelteto_id) VALUES (?, ?, ?, ?, ?)',
      [leiras, cpu, ram, hdd, uzemelteto_id]
    );
    return result.insertId;
  }

  // Update device
  static async update(id, leiras, cpu, ram, hdd, uzemelteto_id) {
    const [result] = await db.execute(
      'UPDATE eszkoz SET leiras = ?, cpu = ?, ram = ?, hdd = ?, uzemelteto_id = ? WHERE id = ?',
      [leiras, cpu, ram, hdd, uzemelteto_id, id]
    );
    return result.affectedRows;
  }

  // Delete device
  static async delete(id) {
    const [result] = await db.execute(
      'DELETE FROM eszkoz WHERE id = ?',
      [id]
    );
    return result.affectedRows;
  }
}

export default EszkozModel;