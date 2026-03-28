import LogModel from "../models/Log.js";
import FoglalasModel from "../models/Foglalas.js";

const ensureFoglalasAccess = async (req, res, foglalas_id) => {
  const foglalas = await FoglalasModel.findById(foglalas_id);
  if (!foglalas) {
    res.status(404).json({ message: "Foglalás nem található." });
    return false;
  }

  const isAdmin = req.user?.role === "admin";
  const isOwner = foglalas.felhasznalo_id === req.user?.id;

  if (!isAdmin && !isOwner) {
    res
      .status(403)
      .json({ message: "Nincs jogosultságod ehhez a foglaláshoz." });
    return false;
  }

  return true;
};

export const getAll = async (req, res) => {
  try {
    const logs = await LogModel.getAll();
    res.json(logs);
  } catch (error) {
    console.error("Hiba a logok lekérésekor:", error);
    res.status(500).json({
      message: "Szerver hiba a logok lekérdezése során.",
    });
  }
};

export const getById = async (req, res) => {
  try {
    const id = req.params.id;
    const log = await LogModel.findById(id);

    if (!log) {
      return res.status(404).json({ message: "Log nem található." });
    }

    const hasAccess = await ensureFoglalasAccess(req, res, log.foglalas_id);
    if (!hasAccess) return;

    res.json(log);
  } catch (error) {
    console.error("Hiba a log lekérésekor:", error);
    res.status(500).json({
      message: "Szerver hiba a log lekérdezése során.",
    });
  }
};

export const getByFoglalasId = async (req, res) => {
  try {
    const foglalas_id = req.params.foglalas_id;

    const hasAccess = await ensureFoglalasAccess(req, res, foglalas_id);
    if (!hasAccess) return;

    const logs = await LogModel.findByFoglalasId(foglalas_id);
    res.json(logs);
  } catch (error) {
    console.error("Hiba a logok lekérésekor:", error);
    res.status(500).json({
      message: "Szerver hiba a logok lekérdezése során.",
    });
  }
};

export const create = async (req, res) => {
  try {
    const { foglalas_id, uzenet } = req.body;

    if (!foglalas_id || !uzenet) {
      return res
        .status(400)
        .json({ message: "Foglalás azonosító és üzenet kötelező." });
    }

    const hasAccess = await ensureFoglalasAccess(req, res, foglalas_id);
    if (!hasAccess) return;

    const logId = await LogModel.create(foglalas_id, uzenet);

    res.status(201).json({ message: "Log létrehozva.", id: logId });
  } catch (error) {
    console.error("Hiba a log létrehozásakor:", error);
    res.status(500).json({
      message: "Szerver hiba a log létrehozása során.",
    });
  }
};

export const update = async (req, res) => {
  try {
    const id = req.params.id;
    const { uzenet } = req.body;

    if (!uzenet) {
      return res.status(400).json({ message: "Üzenet megadása kötelező." });
    }

    const existing = await LogModel.findById(id);
    if (!existing) {
      return res.status(404).json({ message: "Log nem található." });
    }

    const hasAccess = await ensureFoglalasAccess(
      req,
      res,
      existing.foglalas_id,
    );
    if (!hasAccess) return;

    const affectedRows = await LogModel.update(id, uzenet);

    if (affectedRows === 0) {
      return res.status(404).json({ message: "Log nem található." });
    }

    res.json({ message: "Log sikeresen frissítve." });
  } catch (error) {
    console.error("Hiba a log frissítésekor:", error);
    res.status(500).json({
      message: "Szerver hiba a log frissítése során.",
    });
  }
};

export const deleteLog = async (req, res) => {
  try {
    const id = req.params.id;
    const existing = await LogModel.findById(id);

    if (!existing) {
      return res.status(404).json({ message: "Log nem található." });
    }

    const hasAccess = await ensureFoglalasAccess(
      req,
      res,
      existing.foglalas_id,
    );
    if (!hasAccess) return;

    const affectedRows = await LogModel.delete(id);

    if (affectedRows === 0) {
      return res.status(404).json({ message: "Log nem található." });
    }

    res.json({ message: "Log sikeresen törölve." });
  } catch (error) {
    console.error("Hiba a log törlésekor:", error);
    res.status(500).json({
      message: "Szerver hiba a log törlése során.",
    });
  }
};
