import express from "express";
import * as foglalasController from "../controllers/foglalasController.js";
import { verifyToken, isAdmin } from "../middleware/auth.js";

const router = express.Router();

router.post("/", verifyToken, foglalasController.create);
router.get("/my", verifyToken, foglalasController.getMyReservations);
router.delete("/:id", verifyToken, isAdmin, foglalasController.deleteReservation);
router.get("/", verifyToken, isAdmin, foglalasController.getAll);

export default router;