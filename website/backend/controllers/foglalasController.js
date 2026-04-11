import FoglalasModel from "../models/Foglalas.js";
import IdopontModel from "../models/Idopont.js";
import {
  EMAIL_REGEX,
  FULL_NAME_REGEX,
  NAME_REGEX,
  PHONE_REGEX,
  isValidDateValue,
  isValidPositiveInteger,
  normalizeText,
} from "../utils/validation.js";

const validateOptionalTextField = (value, maxLength) => {
  if (value == null || value === "") return true;
  return typeof value === "string" && value.trim().length <= maxLength;
};

export const create = async (req, res) => {
  try {
    const {
      eszkoz_id,
      idopont_id,
      berlesi_kezdete,
      berlesi_vege,
      mentor_id,
      mentor_nev,
      ugyfel_nev,
      szamlazasi_nev,
      email,
      telefon,
      megjegyzes,
    } = req.body;
    const felhasznalo_id = req.user.id;

    if (
      !isValidPositiveInteger(eszkoz_id) ||
      !isValidPositiveInteger(idopont_id)
    ) {
      return res
        .status(400)
        .json({
          message: "A foglaláshoz érvényes eszköz és időpont kötelező.",
        });
    }

    const normalizedMentorName = normalizeText(mentor_nev);
    const normalizedContactName = normalizeText(ugyfel_nev);
    const normalizedBillingName = normalizeText(szamlazasi_nev);
    const normalizedEmail = normalizeText(email).toLowerCase();
    const normalizedPhone = normalizeText(telefon);
    const normalizedNote = normalizeText(megjegyzes);

    if (normalizedMentorName && !NAME_REGEX.test(normalizedMentorName)) {
      return res
        .status(400)
        .json({ message: "A mentor neve érvénytelen formátumú." });
    }

    if (normalizedBillingName && !FULL_NAME_REGEX.test(normalizedBillingName)) {
      return res
        .status(400)
        .json({ message: "A számlázási névhez teljes név szükséges." });
    }

    if (normalizedEmail && !EMAIL_REGEX.test(normalizedEmail)) {
      return res.status(400).json({ message: "Érvényes email címet adj meg." });
    }

    if (normalizedPhone && !PHONE_REGEX.test(normalizedPhone)) {
      return res
        .status(400)
        .json({ message: "Érvényes telefonszámot adj meg." });
    }

    if (
      !validateOptionalTextField(mentor_id, 100) ||
      !validateOptionalTextField(normalizedContactName, 100) ||
      !validateOptionalTextField(normalizedNote, 1000)
    ) {
      return res
        .status(400)
        .json({ message: "Túl hosszú szöveges adat érkezett." });
    }

    const idopont = await IdopontModel.findById(idopont_id);
    if (!idopont) {
      return res.status(404).json({ message: "Időpont nem található." });
    }

    if (idopont.statusz !== "available") {
      return res
        .status(400)
        .json({ message: "Ez az átvételi időpont már nem érhető el." });
    }

    const reserved = await IdopontModel.reserve(idopont_id);
    if (reserved === 0) {
      return res
        .status(400)
        .json({ message: "Ez az átvételi időpont már nem érhető el." });
    }

    const normalizedStart = berlesi_kezdete || idopont.atvetel_datum;
    const normalizedEnd = berlesi_vege || normalizedStart;

    if (
      !isValidDateValue(normalizedStart) ||
      !isValidDateValue(normalizedEnd)
    ) {
      await IdopontModel.release(idopont_id);
      return res.status(400).json({ message: "Érvénytelen dátum formátum." });
    }

    const start = new Date(normalizedStart);
    const end = new Date(normalizedEnd);

    if (start > end) {
      await IdopontModel.release(idopont_id);
      return res.status(400).json({
        message: "A bérlés kezdete nem lehet későbbi, mint a bérlés vége.",
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (start < today) {
      await IdopontModel.release(idopont_id);
      return res
        .status(400)
        .json({ message: "A bérlés kezdete nem lehet a múltban." });
    }

    const foglalasId = await FoglalasModel.create(
      Number(eszkoz_id),
      Number(idopont_id),
      felhasznalo_id,
      normalizedStart,
      normalizedEnd,
      normalizeText(mentor_id) || null,
      normalizedMentorName || null,
      normalizedContactName || null,
      normalizedBillingName || null,
      normalizedEmail || null,
      normalizedPhone || null,
      normalizedNote || null,
    );

    res
      .status(201)
      .json({ message: "Foglalás sikeresen létrehozva.", id: foglalasId });
  } catch (error) {
    console.error("Hiba a foglalás létrehozásakor:", error);
    res
      .status(500)
      .json({ message: "Szerver hiba a foglalás létrehozása során." });
  }
};

export const getAll = async (req, res) => {
  try {
    const foglalasok = await FoglalasModel.getAll();
    res.json(foglalasok);
  } catch (error) {
    console.error("Hiba a foglalások lekérésekor:", error);
    res
      .status(500)
      .json({ message: "Szerver hiba a foglalások lekérdezése során." });
  }
};

export const getMyReservations = async (req, res) => {
  try {
    const foglalasok = await FoglalasModel.getByUserId(req.user.id);
    res.json(foglalasok);
  } catch (error) {
    console.error("Hiba a saját foglalások lekérésekor:", error);
    res
      .status(500)
      .json({ message: "Szerver hiba a saját foglalások lekérdezése során." });
  }
};

export const deleteReservation = async (req, res) => {
  try {
    const id = req.params.id;
    if (!isValidPositiveInteger(id)) {
      return res
        .status(400)
        .json({ message: "Érvénytelen foglalás azonosító." });
    }

    const reservation = await FoglalasModel.findById(id);
    if (!reservation) {
      return res.status(404).json({ message: "Foglalás nem található." });
    }

    const isAdmin = req.user.role === "admin";
    const isOwner = reservation.felhasznalo_id === req.user.id;
    if (!isAdmin && !isOwner) {
      return res
        .status(403)
        .json({ message: "Csak a saját foglalásodat törölheted." });
    }

    const affectedRows = await FoglalasModel.deleteById(id);
    if (affectedRows === 0) {
      return res.status(404).json({ message: "Foglalás nem található." });
    }

    if (reservation.idopont_id) {
      try {
        await IdopontModel.release(reservation.idopont_id);
      } catch (releaseError) {
        console.error(
          "Figyelmeztetés: időpont felszabadítás sikertelen:",
          releaseError,
        );
      }
    }

    res.json({ message: "Foglalás sikeresen törölve." });
  } catch (error) {
    console.error("Hiba a foglalás törlésekor:", error);
    res.status(500).json({ message: "Szerver hiba a foglalás törlése során." });
  }
};
