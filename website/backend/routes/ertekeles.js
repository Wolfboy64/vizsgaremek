import express from "express";
import * as ertekelesController from "../controllers/ertekelesController.js";
import { verifyToken, isAdmin } from "../middleware/auth.js";

const router = express.Router();

router.get("/", verifyToken, isAdmin, ertekelesController.getAll);
router.get(
  "/foglalas/:foglalas_id",
  verifyToken,
  ertekelesController.getByFoglalasId,
);
router.get("/:id", verifyToken, ertekelesController.getById);
router.post("/", verifyToken, ertekelesController.create);
router.put("/:id", verifyToken, ertekelesController.update);
router.delete("/:id", verifyToken, ertekelesController.deleteErtekeles);

export default router;
