import express from "express";
import * as eszkozController from "../controllers/eszkozController.js";
import { verifyToken, isAdmin } from "../middleware/auth.js";

const router = express.Router();

router.get("/", eszkozController.getAll);
router.get("/:id", eszkozController.getById);

router.post("/", verifyToken, isAdmin, eszkozController.create);
router.put("/:id", verifyToken, isAdmin, eszkozController.update);
router.delete("/:id", verifyToken, isAdmin, eszkozController.deleteReservation);

export default router;
