import UzemeltetoModel from "../models/Uzemelteto.js";

export const getAll = async (req, res) => {
  try {
    const uzemeltetok = await UzemeltetoModel.getAll();
    res.json(uzemeltetok);
  } catch (error) {
    console.error("Hiba az uzemeltetok lekeresekor:", error);
    res.status(500).json({
      message: "Szerver hiba az uzemeltetok lekerdezese soran.",
    });
  }
};

export const getById = async (req, res) => {
  try {
    const id = req.params.id;
    const uzemelteto = await UzemeltetoModel.findById(id);

    if (!uzemelteto) {
      return res.status(404).json({ message: "Uzemelteto nem talalhato." });
    }

    res.json(uzemelteto);
  } catch (error) {
    console.error("Hiba az uzemelteto lekeresekor:", error);
    res.status(500).json({
      message: "Szerver hiba az uzemelteto lekerdezese soran.",
    });
  }
};

export const create = async (req, res) => {
  try {
    const { nev, leiras } = req.body;

    if (!nev) {
      return res
        .status(400)
        .json({ message: "A nev megadasa kotelezo." });
    }

    const uzemeltetoId = await UzemeltetoModel.create(nev, leiras ?? null);

    res.status(201).json({
      message: "Uzemelteto sikeresen letrehozva.",
      id: uzemeltetoId,
    });
  } catch (error) {
    console.error("Hiba az uzemelteto letrehozasakor:", error);
    res.status(500).json({
      message: "Szerver hiba az uzemelteto letrehozasa soran.",
    });
  }
};

export const update = async (req, res) => {
  try {
    const id = req.params.id;
    const { nev, leiras } = req.body;

    if (!nev) {
      return res
        .status(400)
        .json({ message: "A nev megadasa kotelezo." });
    }

    const affectedRows = await UzemeltetoModel.update(
      id,
      nev,
      leiras ?? null,
    );

    if (affectedRows === 0) {
      return res.status(404).json({ message: "Uzemelteto nem talalhato." });
    }

    res.json({ message: "Uzemelteto sikeresen frissitve." });
  } catch (error) {
    console.error("Hiba az uzemelteto frissitesekor:", error);
    res.status(500).json({
      message: "Szerver hiba az uzemelteto frissitese soran.",
    });
  }
};

export const deleteUzemelteto = async (req, res) => {
  try {
    const id = req.params.id;
    const affectedRows = await UzemeltetoModel.delete(id);

    if (affectedRows === 0) {
      return res.status(404).json({ message: "Uzemelteto nem talalhato." });
    }

    res.json({ message: "Uzemelteto sikeresen torolve." });
  } catch (error) {
    console.error("Hiba az uzemelteto torlesekor:", error);
    res.status(500).json({
      message: "Szerver hiba az uzemelteto torlese soran.",
    });
  }
};
