import db from "../config/database.js";

class MentorErtekelesModel {
  static async findByFoglalasId(foglalas_id) {
    const [rows] = await db.execute(
      "SELECT * FROM mentor_ertekeles WHERE foglalas_id = ?",
      [foglalas_id],
    );
    return rows[0] || null;
  }

  static async upsert({ foglalas_id, mentor_id, felhasznalo_id, pontszam, review }) {
    await db.execute(
      `INSERT INTO mentor_ertekeles
       (foglalas_id, mentor_id, felhasznalo_id, pontszam, review)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         pontszam = VALUES(pontszam),
         review = VALUES(review),
         updated_at = CURRENT_TIMESTAMP`,
      [foglalas_id, mentor_id, felhasznalo_id, pontszam, review],
    );

    return this.findByFoglalasId(foglalas_id);
  }

  static async getAverageByMentorId(mentor_id) {
    const [rows] = await db.execute(
      `SELECT mentor_id,
              ROUND(AVG(pontszam), 2) AS atlag,
              COUNT(*) AS darab
       FROM mentor_ertekeles
       WHERE mentor_id = ?
       GROUP BY mentor_id`,
      [mentor_id],
    );

    if (!rows[0]) {
      return {
        mentor_id,
        atlag: null,
        darab: 0,
      };
    }

    return rows[0];
  }
}

export default MentorErtekelesModel;
