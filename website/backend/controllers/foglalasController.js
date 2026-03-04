import FoglalasModel from "../models/Foglalas.js";
import IdopontModel from "../models/Idopont.js";

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

    if (!eszkoz_id || !idopont_id) {
      return res.status(400).json({ message: "A foglaláshoz eszköz és időpont kötelező." });
    }

    const idopont = await IdopontModel.findById(idopont_id);

    if (!idopont) {
      return res.status(404).json({ message: "Időpont nem található." });
    }

    if (idopont.statusz !== "available") {
      return res.status(400).json({ message: "Ez az átvételi időpont már nem elérhető" });
    }

    const reserved = await IdopontModel.reserve(idopont_id);

    if (reserved === 0) {
      return res.status(400).json({ message: "Ez az átvételi időpont már nem elérhető" });
    }

    const normalizedStart = berlesi_kezdete || idopont.atvetel_datum;
    const normalizedEnd = berlesi_vege || normalizedStart;

    const start = new Date(normalizedStart);
    const end = new Date(normalizedEnd);

    if (start > end) {
      return res.status(400).json({
        message: "A bérlési kezdete nem lehet későbbi mint a bérlési vége.",
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (start < today) {
      return res.status(400).json({ message: "A bérlési kezdete nem lehet a múltban." });
    }

    const foglalasId = await FoglalasModel.create(
      eszkoz_id,
      idopont_id,
      felhasznalo_id,
      normalizedStart,
      normalizedEnd,
      mentor_id?.trim() || null,
      mentor_nev?.trim() || null,
      ugyfel_nev?.trim() || null,
      szamlazasi_nev?.trim() || null,
      email?.trim() || null,
      telefon?.trim() || null,
      megjegyzes?.trim() || null,
    );

    res.status(201).json({ message: "Foglalás sikeresen létrehozva.", id: foglalasId });
  } catch (error) {
    console.error("Hiba a foglalás létrehozásakor:", error);
    res.status(500).json({ message: "Szerver hiba a foglalás létrehozása során." });
  }
};

export const getAll = async (req, res) => {
  try {
    const foglalasok = await FoglalasModel.getAll();
    res.json(foglalasok);
  } catch (error) {
    console.error("Hiba a foglalások lekérésekor:", error);
    res.status(500).json({ message: "Szerver hiba a foglalások lekérdezése során." });
  }
};

export const getMyReservations = async (req, res) => {
  try {
    const foglalasok = await FoglalasModel.getByUserId(req.user.id);
    res.json(foglalasok);
  } catch (error) {
    console.error("Hiba a saját foglalások lekérésekor:", error);
    res.status(500).json({ message: "Szerver hiba a saját foglalások lekérdezése során." });
  }
};

export const deleteReservation = async (req, res) => {
  try {
    const id = req.params.id;
    const reservation = await FoglalasModel.findById(id);

    if (!reservation) {
      return res.status(404).json({ message: "Foglalás nem található." });
    }

    const isAdmin = req.user.role === "admin";
    const isOwner = reservation.felhasznalo_id === req.user.id;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        message: "Csak a saját foglalásodat törölheted.",
      });
    }

    const affectedRows = await FoglalasModel.deleteById(id);

    if (affectedRows === 0) {
      return res.status(404).json({ message: "Foglalás nem található." });
    }

    if (reservation.idopont_id) {
      try {
        await IdopontModel.release(reservation.idopont_id);
      } catch (releaseError) {
        console.error("Figyelmeztetés: időpont felszabadítás sikertelen:", releaseError);
      }
    }

    res.json({ message: "Foglalás sikeresen törölve." });
  } catch (error) {
    console.error("Hiba a foglalás törlésekor:", error);
    res.status(500).json({ message: "Szerver hiba a foglalás törlése során." });
  }
};
