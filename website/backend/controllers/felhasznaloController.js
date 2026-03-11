import FelhasznaloModel from "../models/Felhasznalo.js";

export const getAll = async (req, res) => {
  try {
    const users = await FelhasznaloModel.getAll();
    res.json(users);
  } catch (error) {
    console.error("Hiba a felhasználók lekérésekor:", error);
    res.status(500).json({
      message: "Szerver hiba a felhasználók lekérdezése során.",
    });
  }
};

export const create = async (req, res) => {
  try {
    const { nev, elerhetoseg, jelszo, role } = req.body;

    if (!nev || !elerhetoseg || !jelszo) {
      return res
        .status(400)
        .json({ message: "Minden mező kitöltése kötelező." });
    }

    const normalizedRole = role ?? "user";
    if (!["user", "admin"].includes(normalizedRole)) {
      return res.status(400).json({ message: "Érvénytelen szerepkör." });
    }

    const existingUser =
      await FelhasznaloModel.findByElerhetoseg(elerhetoseg);
    if (existingUser) {
      return res.status(400).json({ message: "Ez az elérhetőség már foglalt." });
    }

    const userId = await FelhasznaloModel.create(
      nev,
      elerhetoseg,
      jelszo,
      normalizedRole,
    );

    res.status(201).json({ message: "Felhasználó létrehozva.", userId });
  } catch (error) {
    console.error("Hiba a felhasználó létrehozásakor:", error);
    res.status(500).json({
      message: "Szerver hiba a felhasználó létrehozása során.",
    });
  }
};

export const getById = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await FelhasznaloModel.findById(id);

    if (!user) {
      return res.status(404).json({ message: "Felhasználó nem található." });
    }

    res.json(user);
  } catch (error) {
    console.error("Hiba a felhasználó lekérésekor:", error);
    res.status(500).json({
      message: "Szerver hiba a felhasználó lekérdezése során.",
    });
  }
};

export const update = async (req, res) => {
  try {
    const id = req.params.id;
    const { nev, elerhetoseg, allapot } = req.body;

    if (!nev || !elerhetoseg || !allapot) {
      return res
        .status(400)
        .json({ message: "Minden mező kitöltése kötelező." });
    }

    const affectedRows = await FelhasznaloModel.update(
      id,
      nev,
      elerhetoseg,
      allapot,
    );

    if (affectedRows === 0) {
      return res.status(404).json({ message: "Felhasználó nem található." });
    }

    res.json({ message: "Felhasználó sikeresen frissítve." });
  } catch (error) {
    console.error("Hiba a felhasználó frissítésekor:", error);
    res.status(500).json({
      message: "Szerver hiba a felhasználó frissítése során.",
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const id = req.params.id;
    const affectedRows = await FelhasznaloModel.delete(id);

    if (affectedRows === 0) {
      return res.status(404).json({ message: "Felhasználó nem található." });
    }

    res.json({ message: "Felhasználó sikeresen törölve." });
  } catch (error) {
    console.error("Hiba a felhasználó törlésekor:", error);
    res.status(500).json({
      message: "Szerver hiba a felhasználó törlése során.",
    });
  }
};
