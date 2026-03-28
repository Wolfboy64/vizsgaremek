import UzemeltetoModel from "../models/Uzemelteto.js";

export const getAll = async (req, res) => {
  try {
    const uzemeltetok = await UzemeltetoModel.getAll();
    res.json(uzemeltetok);
  } catch (error) {
    console.error("Hiba az üzemeltetők lekérésekor:", error);
    res.status(500).json({
      message: "Szerver hiba az üzemeltetők lekérdezése során.",
    });
  }
};

export const getById = async (req, res) => {
  try {
    const id = req.params.id;
    const uzemelteto = await UzemeltetoModel.findById(id);

    if (!uzemelteto) {
      return res.status(404).json({ message: "Üzemeltető nem található." });
    }

    res.json(uzemelteto);
  } catch (error) {
    console.error("Hiba az üzemeltető lekérésekor:", error);
    res.status(500).json({
      message: "Szerver hiba az üzemeltető lekérdezése során.",
    });
  }
};

export const create = async (req, res) => {
  try {
    const { nev, leiras } = req.body;

    if (!nev) {
      return res.status(400).json({ message: "A név megadása kötelező." });
    }

    const uzemeltetoId = await UzemeltetoModel.create(nev, leiras ?? null);

    res.status(201).json({
      message: "Üzemeltető sikeresen létrehozva.",
      id: uzemeltetoId,
    });
  } catch (error) {
    console.error("Hiba az üzemeltető létrehozásakor:", error);
    res.status(500).json({
      message: "Szerver hiba az üzemeltető létrehozása során.",
    });
  }
};

export const update = async (req, res) => {
  try {
    const id = req.params.id;
    const { nev, leiras } = req.body;

    if (!nev) {
      return res.status(400).json({ message: "A név megadása kötelező." });
    }

    const affectedRows = await UzemeltetoModel.update(id, nev, leiras ?? null);

    if (affectedRows === 0) {
      return res.status(404).json({ message: "Üzemeltető nem található." });
    }

    res.json({ message: "Üzemeltető sikeresen frissítve." });
  } catch (error) {
    console.error("Hiba az üzemeltető frissítésekor:", error);
    res.status(500).json({
      message: "Szerver hiba az üzemeltető frissítése során.",
    });
  }
};

export const deleteUzemelteto = async (req, res) => {
  try {
    const id = req.params.id;
    const affectedRows = await UzemeltetoModel.delete(id);

    if (affectedRows === 0) {
      return res.status(404).json({ message: "Üzemeltető nem található." });
    }

    res.json({ message: "Üzemeltető sikeresen törölve." });
  } catch (error) {
    console.error("Hiba az üzemeltető törlésekor:", error);
    res.status(500).json({
      message: "Szerver hiba az üzemeltető törlése során.",
    });
  }
};
