import db from "../config/database.js";

class FoglalasModel {
  // Foglalás létrehozása
  static async create(
    eszkoz_id,
    idopont_id,
    felhasznalo_id,
    berlesi_kezdete,
    berlesi_vege
  ) {
    const [result] = await db.execute(
      `INSERT INTO foglalas 
       (felhasznalo_id, eszkoz_id, idopont_id, berlesi_kezdete, berlesi_vege, foglalas_datuma, statusz) 
       VALUES (?, ?, ?, ?, ?, NOW(), ?)`,
      [
        felhasznalo_id,
        eszkoz_id,
        idopont_id,
        berlesi_kezdete,
        berlesi_vege,
        "confirmed",
      ]
    );
    return result.insertId;
  }

  // Minden foglalás lekérése
  static async getAll() {
    const [rows] = await db.execute(`
      SELECT 
        f.id,
        f.felhasznalo_id,
        f.eszkoz_id,
        f.foglalas_datuma,
        felh.nev as felhasznalo_nev,
        felh.elerhetoseg,
        e.cpu,
        e.ram,
        e.hdd,
        e.leiras as eszkoz_leiras
      FROM foglalas f
      JOIN felhasznalo felh ON f.felhasznalo_id = felh.id
      JOIN eszkoz e ON f.eszkoz_id = e.id
      ORDER BY f.foglalas_datuma DESC
    `);
    return rows;
  }

  // Foglalások lekérése felhasználó ID alapján
  static async getByUserId(felhasznalo_id) {
    const [rows] = await db.execute(
      `
      SELECT 
        f.id,
        f.eszkoz_id,
        f.foglalas_datuma,
        f.berlesi_kezdete,
        f.berlesi_vege,
        e.cpu,
        e.ram,
        e.hdd,
        e.leiras as eszkoz_leiras,
        i.atvetel_datum,
        i.atvetel_idopont
      FROM foglalas f
      JOIN eszkoz e ON f.eszkoz_id = e.id
      LEFT JOIN idopont i ON f.idopont_id = i.id
      WHERE f.felhasznalo_id = ?
      ORDER BY f.foglalas_datuma DESC
      `,
      [felhasznalo_id]
    );
    return rows;
  }

  // Foglalás törlése
  static async deleteById(id) {
    const [result] = await db.execute("DELETE FROM foglalas WHERE id = ?", [
      id,
    ]);
    return result.affectedRows;
  }
}

export default FoglalasModel;