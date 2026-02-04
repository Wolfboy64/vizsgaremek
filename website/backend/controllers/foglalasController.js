import FoglalasModel from "../models/FoglalasModel.js";

export const create = async (req, res) => {
  try {
    const { eszkoz_id, idopont_id, berlesi_kezdete, berlesi_vege } = req.body;
    const felhasznalo_id = req.user.id;

    if (!eszkoz_id || !idopont_id || !berlesi_kezdete || !berlesi_vege) {
      return res
        .status(400)
        .json({ message: "Minden mező kitöltése kötelező." });
    }

    const start = new Date(berlesi_kezdete);
    const end = new Date(berlesi_vege);

    if (start >= end) {
      return res.status(400).json({
        message: "A bérlési kezdete nem lehet későbbi mint a bérlési vége.",
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (start < today) {
      return res
        .status(400)
        .json({ message: "A bérlési kezdete nem lehet a múltban." });
    }

    const IdopontModel = require("../models/Idopont.js").default;
    const idopont = await IdopontModel.findById(idopont_id);

    if (!idopont) {
      return res.status(404).json({ message: "Időpont nem található." });
    }

    if (idopont.statusz !== "available") {
      return res
        .status(400)
        .json({ message: "Ez az átvételi időpont már nem elérhető" });
    }

    const reserved = await IdopontModel.reserve(idopont_id);

    if (reserved === 0) {
      return res
        .status(400)
        .json({ message: "Ez az átvételi időpont már nem elérhető" });
    }

    const foglalasId = await FoglalasModel.create(
      eszkoz_id,
      idopont_id,
      felhasznalo_id,
      berlesi_kezdete,
      berlesi_vege,
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
    const affectedRows = await FoglalasModel.delete(id);

    if (affectedRows === 0) {
      return res.status(404).json({ message: "Foglalás nem található." });
    }

    res.json({ message: "Foglalás sikeresen törölve." });
  } catch (error) {
    console.error("Hiba a foglalás törlésekor:", error);
    res.status(500).json({ message: "Szerver hiba a foglalás törlése során." });
  }
};
