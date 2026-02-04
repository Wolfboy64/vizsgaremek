import EszkozModel from "../models/Eszkoz.js";

export const getAll = async (req, res) => {
  try {
    const eszkozok = await EszkozModel.getAll();
    res.json(eszkozok);
  } catch (error) {
    console.error("Hiba az eszközök lekérésekor:", error);
    res
      .status(500)
      .json({ message: "Szerver hiba az eszközök lekérdezése során." });
  }
};

export const getById = async (req, res) => {
  try {
    const id = req.params.id;
    const eszkoz = await EszkozModel.findById(id);

    if (!eszkoz) {
      return res.status(404).json({ message: "Eszköz nem található." });
    }

    res.json(eszkoz);
  } catch (error) {
    console.error("Hiba az eszköz lekérésekor:", error);
    res
      .status(500)
      .json({ message: "Szerver hiba az eszköz lekérdezése során." });
  }
};

export const create = async (req, res) => {
  try {
    const { leiras, cpu, ram, hdd, uzemelteto_id } = req.body;

    if (!cpu || !ram || !hdd) {
      return res
        .status(400)
        .json({ message: "CPU, RAM és HDD értékek megadása kötelező." });
    }
    const eszkozId = await EszkozModel.create(
      leiras,
      cpu,
      ram,
      hdd,
      uzemelteto_id,
    );
    res
      .status(201)
      .json({ message: "Eszköz sikeresen létrehozva.", id: eszkozId });
  } catch (error) {
    console.error("Hiba az eszköz létrehozásakor:", error);
    res
      .status(500)
      .json({ message: "Szerver hiba az eszköz létrehozása során." });
  }
};

export const update = async (req, res) => {
  try {
    const id = req.params.id;
    const { leiras, cpu, ram, hdd, uzemelteto_id } = req.body;

    const affectedRows = await EszkozModel.update(
      id,
      leiras,
      cpu,
      ram,
      hdd,
      uzemelteto_id,
    );

    if (affectedRows === 0) {
      return res.status(404).json({ message: "Eszköz nem található." });
    }

    res.json({ message: "Eszköz sikeresen frissítve." });
  } catch (error) {
    console.error("Hiba az eszköz frissítésekor:", error);
    res
      .status(500)
      .json({ message: "Szerver hiba az eszköz frissítése során." });
  }
};

export const deleteReservation = async (req, res) => {
  try {
    const id = req.params.id;
    const affectedRows = await EszkozModel.delete(id);

    if (affectedRows === 0) {
      return res.status(404).json({ message: "Eszköz nem található." });
    }

    res.json({ message: "Eszköz sikeresen törölve." });
  } catch (error) {
    console.error("Hiba az eszköz törlésekor:", error);
    res.status(500).json({ message: "Szerver hiba az eszköz törlése során." });
  }
};
