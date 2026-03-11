import express from "express";
import * as uzemeltetoController from "../controllers/uzemeltetoController.js";
import { verifyToken, isAdmin } from "../middleware/auth.js";

const router = express.Router();

router.get("/", uzemeltetoController.getAll);
router.get("/:id", uzemeltetoController.getById);
router.post("/", verifyToken, isAdmin, uzemeltetoController.create);
router.put("/:id", verifyToken, isAdmin, uzemeltetoController.update);
router.delete("/:id", verifyToken, isAdmin, uzemeltetoController.deleteUzemelteto);

export default router;
