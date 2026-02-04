import db from '../config/database.js';
import bcrypt from 'bcrypt';

class FelhasznaloModel {
  // Create new user
  static async create(nev, elerhetoseg, jelszo, role = 'user') {
    const hashedPassword = await bcrypt.hash(jelszo, 10);
    const [result] = await db.execute(
      'INSERT INTO felhasznalo (nev, elerhetoseg, jelszo, role, allapot) VALUES (?, ?, ?, ?, ?)',
      [nev, elerhetoseg, hashedPassword, role, 'aktiv']
    );
    return result.insertId;
  }

  // Find user by email/contact
  static async findByElerhetoseg(elerhetoseg) {
    const [rows] = await db.execute(
      'SELECT * FROM felhasznalo WHERE elerhetoseg = ?',
      [elerhetoseg]
    );
    return rows[0];
  }

  // Find user by ID
  static async findById(id) {
    const [rows] = await db.execute(
      'SELECT id, nev, elerhetoseg, allapot, role FROM felhasznalo WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  // Get all users (admin only)
  static async getAll() {
    const [rows] = await db.execute(
      'SELECT id, nev, elerhetoseg, allapot, role FROM felhasznalo'
    );
    return rows;
  }

  // Update user
  static async update(id, nev, elerhetoseg, allapot) {
    const [result] = await db.execute(
      'UPDATE felhasznalo SET nev = ?, elerhetoseg = ?, allapot = ? WHERE id = ?',
      [nev, elerhetoseg, allapot, id]
    );
    return result.affectedRows;
  }

  // Delete user
  static async delete(id) {
    const [result] = await db.execute(
      'DELETE FROM felhasznalo WHERE id = ?',
      [id]
    );
    return result.affectedRows;
  }

  // Verify password
  static async verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}

export default FelhasznaloModel;