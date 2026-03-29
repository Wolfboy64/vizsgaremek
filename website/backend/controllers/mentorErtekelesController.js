import FoglalasModel from "../models/Foglalas.js";
import MentorErtekelesModel from "../models/MentorErtekeles.js";
import { normalizeText } from "../utils/validation.js";

const isValidPontszam = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 1 && parsed <= 5 && Number.isInteger(parsed * 2);
};

const ensureFoglalasAccess = async (req, res, foglalas_id) => {
  const foglalas = await FoglalasModel.findById(foglalas_id);

  if (!foglalas) {
    res.status(404).json({ message: "Foglalas nem talalhato." });
    return null;
  }

  const isAdmin = req.user?.role === "admin";
  const isOwner = foglalas.felhasznalo_id === req.user?.id;

  if (!isAdmin && !isOwner) {
    res.status(403).json({ message: "Nincs jogosultsagod ehhez a foglalashoz." });
    return null;
  }

  return foglalas;
};

export const upsertMentorErtekeles = async (req, res) => {
  try {
    const { foglalas_id, pontszam, review } = req.body;

    if (!foglalas_id) {
      return res.status(400).json({ message: "Foglalas azonosito kotelezo." });
    }

    if (!isValidPontszam(pontszam)) {
      return res.status(400).json({
        message: "A pontszam 1-5 kozott lehet, 0.5-os lepesekkel.",
      });
    }

    const cleanedReview = normalizeText(review || "");
    if (cleanedReview.length > 1200) {
      return res.status(400).json({ message: "A review maximum 1200 karakter lehet." });
    }

    const foglalas = await ensureFoglalasAccess(req, res, foglalas_id);
    if (!foglalas) return;

    if (!foglalas.mentor_id) {
      return res.status(400).json({
        message: "Ehhez a foglalashoz nincs mentor rendelve, nem ertekelheto.",
      });
    }

    const ertekeles = await MentorErtekelesModel.upsert({
      foglalas_id: Number(foglalas_id),
      mentor_id: String(foglalas.mentor_id),
      felhasznalo_id: req.user.id,
      pontszam: Number(pontszam),
      review: cleanedReview || null,
    });

    const atlag = await MentorErtekelesModel.getAverageByMentorId(String(foglalas.mentor_id));

    res.json({
      message: "Mentor ertekeles sikeresen mentve.",
      ertekeles,
      atlag,
    });
  } catch (error) {
    console.error("Hiba a mentor ertekeles mentesekor:", error);
    res.status(500).json({ message: "Szerver hiba a mentor ertekeles mentesekor." });
  }
};

export const getMentorErtekelesByFoglalas = async (req, res) => {
  try {
    const { foglalas_id } = req.params;
    const foglalas = await ensureFoglalasAccess(req, res, foglalas_id);
    if (!foglalas) return;

    const ertekeles = await MentorErtekelesModel.findByFoglalasId(foglalas_id);
    const atlag = foglalas.mentor_id
      ? await MentorErtekelesModel.getAverageByMentorId(String(foglalas.mentor_id))
      : { mentor_id: null, atlag: null, darab: 0 };

    res.json({
      foglalas_id: Number(foglalas_id),
      mentor_id: foglalas.mentor_id || null,
      ertekeles,
      atlag,
    });
  } catch (error) {
    console.error("Hiba a foglalashoz tartozo mentor ertekeles lekeresekor:", error);
    res.status(500).json({
      message: "Szerver hiba a foglalashoz tartozo mentor ertekeles lekeresekor.",
    });
  }
};

export const getMentorAtlag = async (req, res) => {
  try {
    const { mentor_id } = req.params;
    const cleanedMentorId = normalizeText(mentor_id);

    if (!cleanedMentorId) {
      return res.status(400).json({ message: "Ervenytelen mentor azonosito." });
    }

    const atlag = await MentorErtekelesModel.getAverageByMentorId(cleanedMentorId);
    res.json(atlag);
  } catch (error) {
    console.error("Hiba a mentor atlag lekeresekor:", error);
    res.status(500).json({ message: "Szerver hiba a mentor atlag lekeresekor." });
  }
};
