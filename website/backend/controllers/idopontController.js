import IdopontModel from "../models/Idopont.js";

export const getAvailableByDevice = async (req, res) => {
  try {
    const eszkoz_id = req.params.eszkoz_id;
    const idopontok = await IdopontModel.getAvailableByDevice(eszkoz_id);
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
