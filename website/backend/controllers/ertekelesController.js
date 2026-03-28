import ErtekelesModel from "../models/Ertekeles.js";
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
    const ertekelesek = await ErtekelesModel.getAll();
    res.json(ertekelesek);
  } catch (error) {
    console.error("Hiba az értékelések lekérésekor:", error);
    res.status(500).json({
      message: "Szerver hiba az értékelések lekérdezése során.",
    });
  }
};

export const getById = async (req, res) => {
  try {
    const id = req.params.id;
    const ertekeles = await ErtekelesModel.findById(id);

    if (!ertekeles) {
      return res.status(404).json({ message: "Értékelés nem található." });
    }

    const hasAccess = await ensureFoglalasAccess(
      req,
      res,
      ertekeles.foglalas_id,
    );
    if (!hasAccess) return;

    res.json(ertekeles);
  } catch (error) {
    console.error("Hiba az értékelés lekérésekor:", error);
    res.status(500).json({
      message: "Szerver hiba az értékelés lekérdezése során.",
    });
  }
};

export const getByFoglalasId = async (req, res) => {
  try {
    const foglalas_id = req.params.foglalas_id;

    const hasAccess = await ensureFoglalasAccess(req, res, foglalas_id);
    if (!hasAccess) return;

    const ertekeles = await ErtekelesModel.findByFoglalasId(foglalas_id);

    if (!ertekeles) {
      return res.status(404).json({ message: "Értékelés nem található." });
    }

    res.json(ertekeles);
  } catch (error) {
    console.error("Hiba az értékelés lekérésekor:", error);
    res.status(500).json({
      message: "Szerver hiba az értékelés lekérdezése során.",
    });
  }
};

export const create = async (req, res) => {
  try {
    const { foglalas_id, eszkoz_pontszam, uzemelteto_pontszam, megjegyzes } =
      req.body;

    if (
      !foglalas_id ||
      eszkoz_pontszam == null ||
      uzemelteto_pontszam == null
    ) {
      return res.status(400).json({
        message: "Foglalás azonosító és pontszámok megadása kötelező.",
      });
    }

    const hasAccess = await ensureFoglalasAccess(req, res, foglalas_id);
    if (!hasAccess) return;

    const ertekelesId = await ErtekelesModel.create(
      foglalas_id,
      eszkoz_pontszam,
      uzemelteto_pontszam,
      megjegyzes ?? null,
    );

    res.status(201).json({
      message: "Értékelés sikeresen létrehozva.",
      id: ertekelesId,
    });
  } catch (error) {
    if (error?.code === "ER_DUP_ENTRY") {
      return res
        .status(409)
        .json({ message: "Ehhez a foglaláshoz már van értékelés." });
    }

    console.error("Hiba az értékelés létrehozásakor:", error);
    res.status(500).json({
      message: "Szerver hiba az értékelés létrehozása során.",
    });
  }
};

export const update = async (req, res) => {
  try {
    const id = req.params.id;
    const { eszkoz_pontszam, uzemelteto_pontszam, megjegyzes } = req.body;

    if (eszkoz_pontszam == null || uzemelteto_pontszam == null) {
      return res.status(400).json({
        message: "Pontszámok megadása kötelező.",
      });
    }

    const existing = await ErtekelesModel.findById(id);
    if (!existing) {
      return res.status(404).json({ message: "Értékelés nem található." });
    }

    const hasAccess = await ensureFoglalasAccess(
      req,
      res,
      existing.foglalas_id,
    );
    if (!hasAccess) return;

    const affectedRows = await ErtekelesModel.update(
      id,
      eszkoz_pontszam,
      uzemelteto_pontszam,
      megjegyzes ?? null,
    );

    if (affectedRows === 0) {
      return res.status(404).json({ message: "Értékelés nem található." });
    }

    res.json({ message: "Értékelés sikeresen frissítve." });
  } catch (error) {
    console.error("Hiba az értékelés frissítésekor:", error);
    res.status(500).json({
      message: "Szerver hiba az értékelés frissítése során.",
    });
  }
};

export const deleteErtekeles = async (req, res) => {
  try {
    const id = req.params.id;
    const existing = await ErtekelesModel.findById(id);

    if (!existing) {
      return res.status(404).json({ message: "Értékelés nem található." });
    }

    const hasAccess = await ensureFoglalasAccess(
      req,
      res,
      existing.foglalas_id,
    );
    if (!hasAccess) return;

    const affectedRows = await ErtekelesModel.delete(id);

    if (affectedRows === 0) {
      return res.status(404).json({ message: "Értékelés nem található." });
    }

    res.json({ message: "Értékelés sikeresen törölve." });
  } catch (error) {
    console.error("Hiba az értékelés törlésekor:", error);
    res.status(500).json({
      message: "Szerver hiba az értékelés törlése során.",
    });
  }
};
