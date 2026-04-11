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

  static async getPublicFakeReviews() {
    const [rows] = await db.execute(
      `SELECT
         id,
         user_name,
         COALESCE(
           NULLIF(TRIM(avatar_url), ''),
           CASE
             WHEN id = 1 THEN 'https://xsgames.co/randomusers/avatar.php?g=male&seed=review-bence-k'
             WHEN id = 2 THEN 'https://xsgames.co/randomusers/avatar.php?g=female&seed=review-lili-m'
             WHEN id = 3 THEN 'https://xsgames.co/randomusers/avatar.php?g=male&seed=review-patrik-v'
             WHEN id = 4 THEN 'https://xsgames.co/randomusers/avatar.php?g=male&seed=review-zsombi-r'
             WHEN id = 5 THEN 'https://xsgames.co/randomusers/avatar.php?g=female&seed=review-anna-t'
             ELSE CONCAT(
               'https://xsgames.co/randomusers/avatar.php?g=male&seed=review-',
               id
             )
           END
         ) AS avatar_url,
         review,
         stars,
         updated_at
       FROM page_review
       WHERE is_active = 1
       ORDER BY id ASC`,
    );

    return rows;
  }

  static async getPublicFakeReviewsSummary() {
    const [rows] = await db.execute(
      `SELECT
         ROUND(AVG(stars), 1) AS average_rating,
         COUNT(*) AS total_reviews
       FROM page_review
       WHERE is_active = 1`,
    );

    return rows[0] || { average_rating: null, total_reviews: 0 };
  }
}

export default MentorErtekelesModel;
