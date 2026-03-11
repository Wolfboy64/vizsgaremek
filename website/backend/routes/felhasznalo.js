import express from "express";
import * as felhasznaloController from "../controllers/felhasznaloController.js";
import { verifyToken, isAdmin } from "../middleware/auth.js";

const router = express.Router();

router.get("/", verifyToken, isAdmin, felhasznaloController.getAll);
router.post("/", verifyToken, isAdmin, felhasznaloController.create);
router.get("/:id", verifyToken, felhasznaloController.getById);
router.put("/:id", verifyToken, felhasznaloController.update);
router.delete("/:id", verifyToken, isAdmin, felhasznaloController.deleteUser);

export default router;
