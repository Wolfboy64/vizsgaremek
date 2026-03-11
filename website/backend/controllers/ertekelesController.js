import ErtekelesModel from "../models/Ertekeles.js";
import FoglalasModel from "../models/Foglalas.js";

const ensureFoglalasAccess = async (req, res, foglalas_id) => {
  const foglalas = await FoglalasModel.findById(foglalas_id);
  if (!foglalas) {
    res.status(404).json({ message: "Foglalas nem talalhato." });
    return false;
  }

  const isAdmin = req.user?.role === "admin";
  const isOwner = foglalas.felhasznalo_id === req.user?.id;

  if (!isAdmin && !isOwner) {
    res
      .status(403)
      .json({ message: "Nincs jogosultsagod ehhez a foglalashoz." });
    return false;
  }

  return true;
};

export const getAll = async (req, res) => {
  try {
    const ertekelesek = await ErtekelesModel.getAll();
    res.json(ertekelesek);
  } catch (error) {
    console.error("Hiba az ertekelesek lekeresekor:", error);
    res.status(500).json({
      message: "Szerver hiba az ertekelesek lekerdezese soran.",
    });
  }
};

export const getById = async (req, res) => {
  try {
    const id = req.params.id;
    const ertekeles = await ErtekelesModel.findById(id);

    if (!ertekeles) {
      return res.status(404).json({ message: "Ertekeles nem talalhato." });
    }

    const hasAccess = await ensureFoglalasAccess(
      req,
      res,
      ertekeles.foglalas_id,
    );
    if (!hasAccess) return;

    res.json(ertekeles);
  } catch (error) {
    console.error("Hiba az ertekeles lekeresekor:", error);
    res.status(500).json({
      message: "Szerver hiba az ertekeles lekerdezese soran.",
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
      return res.status(404).json({ message: "Ertekeles nem talalhato." });
    }

    res.json(ertekeles);
  } catch (error) {
    console.error("Hiba az ertekeles lekeresekor:", error);
    res.status(500).json({
      message: "Szerver hiba az ertekeles lekerdezese soran.",
    });
  }
};

export const create = async (req, res) => {
  try {
    const { foglalas_id, eszkoz_pontszam, uzemelteto_pontszam, megjegyzes } =
      req.body;

    if (!foglalas_id || eszkoz_pontszam == null || uzemelteto_pontszam == null) {
      return res.status(400).json({
        message: "Foglalas azonosito es pontszamok megadasa kotelezo.",
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
      message: "Ertekeles sikeresen letrehozva.",
      id: ertekelesId,
    });
  } catch (error) {
    if (error?.code === "ER_DUP_ENTRY") {
      return res
        .status(409)
        .json({ message: "Ehhez a foglalashoz mar van ertekeles." });
    }

    console.error("Hiba az ertekeles letrehozasakor:", error);
    res.status(500).json({
      message: "Szerver hiba az ertekeles letrehozasa soran.",
    });
  }
};

export const update = async (req, res) => {
  try {
    const id = req.params.id;
    const { eszkoz_pontszam, uzemelteto_pontszam, megjegyzes } = req.body;

    if (eszkoz_pontszam == null || uzemelteto_pontszam == null) {
      return res.status(400).json({
        message: "Pontszamok megadasa kotelezo.",
      });
    }

    const existing = await ErtekelesModel.findById(id);
    if (!existing) {
      return res.status(404).json({ message: "Ertekeles nem talalhato." });
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
      return res.status(404).json({ message: "Ertekeles nem talalhato." });
    }

    res.json({ message: "Ertekeles sikeresen frissitve." });
  } catch (error) {
    console.error("Hiba az ertekeles frissitesekor:", error);
    res.status(500).json({
      message: "Szerver hiba az ertekeles frissitese soran.",
    });
  }
};

export const deleteErtekeles = async (req, res) => {
  try {
    const id = req.params.id;
    const existing = await ErtekelesModel.findById(id);

    if (!existing) {
      return res.status(404).json({ message: "Ertekeles nem talalhato." });
    }

    const hasAccess = await ensureFoglalasAccess(
      req,
      res,
      existing.foglalas_id,
    );
    if (!hasAccess) return;

    const affectedRows = await ErtekelesModel.delete(id);

    if (affectedRows === 0) {
      return res.status(404).json({ message: "Ertekeles nem talalhato." });
    }

    res.json({ message: "Ertekeles sikeresen torolve." });
  } catch (error) {
    console.error("Hiba az ertekeles torlesekor:", error);
    res.status(500).json({
      message: "Szerver hiba az ertekeles torlese soran.",
    });
  }
};
