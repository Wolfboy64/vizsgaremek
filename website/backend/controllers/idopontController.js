import IdopontModel from "../models/Idopont.js";

export const getAvailableByDevice = async (req, res) => {
  try {
    const eszkoz_id = req.params.eszkoz_id;
    const idopontok = await IdopontModel.getAvailableByEszkozId(eszkoz_id);
    res.json(idopontok);
  } catch (error) {
    console.error("Hiba az elérhető időpontok lekérésekor:", error);
    res.status(500).json({
      message: "Szerver hiba az elérhető időpontok lekérdezése során.",
    });
  }
};

export const getById = async (req, res) => {
  try {
    const id = req.params.id;
    const idopont = await IdopontModel.findById(id);

    if (!idopont) {
      return res.status(404).json({ message: "Időpont nem található." });
    }

    res.json(idopont);
  } catch (error) {
    console.error("Hiba az időpont lekérésekor:", error);
    res
      .status(500)
      .json({ message: "Szerver hiba az időpont lekérdezése során." });
  }
};

export const getAll = async (req, res) => {
  try {
    const idopontok = await IdopontModel.getAll();
    res.json(idopontok);
  } catch (error) {
    console.error("Hiba az időpontok lekérésekor:", error);
    res
      .status(500)
      .json({ message: "Szerver hiba az időpontok lekérdezése során." });
  }
};

export const create = async (req, res) => {
  try {
    const { eszkoz_id, atvetel_datum, atvetel_idopont } = req.body;

    if (!eszkoz_id || !atvetel_datum || !atvetel_idopont) {
      return res
        .status(400)
        .json({ message: "Minden mező kitöltése kötelező." });
    }

    const idopontId = await IdopontModel.create(
      eszkoz_id,
      atvetel_datum,
      atvetel_idopont,
    );
    res.status(201).json({ message: "Időpont létrehozva.", id: idopontId });
  } catch (error) {
    console.error("Hiba az időpont létrehozásakor:", error);
    res
      .status(500)
      .json({ message: "Szerver hiba az időpont létrehozása során." });
  }
};

export const update = async (req, res) => {
  try {
    const id = req.params.id;
    const { eszkoz_id, atvetel_datum, atvetel_idopont, statusz } = req.body;

    if (!eszkoz_id || !atvetel_datum || !atvetel_idopont || !statusz) {
      return res
        .status(400)
        .json({ message: "Minden mező kitöltése kötelező." });
    }

    const affectedRows = await IdopontModel.update(
      id,
      eszkoz_id,
      atvetel_datum,
      atvetel_idopont,
      statusz,
    );

    if (affectedRows === 0) {
      return res.status(404).json({ message: "Időpont nem található." });
    }

    res.json({ message: "Időpont sikeresen frissítve." });
  } catch (error) {
    console.error("Hiba az időpont frissítésekor:", error);
    res
      .status(500)
      .json({ message: "Szerver hiba az időpont frissítése során." });
  }
};

export const deleteIdopont = async (req, res) => {
  try {
    const id = req.params.id;
    const affectedRows = await IdopontModel.delete(id);

    if (affectedRows === 0) {
      return res.status(404).json({ message: "Időpont nem található." });
    }

    res.json({ message: "Időpont sikeresen törölve." });
  } catch (error) {
    console.error("Hiba az időpont törlésekor:", error);
    res
      .status(500)
      .json({ message: "Szerver hiba az időpont törlése során." });
  }
};
