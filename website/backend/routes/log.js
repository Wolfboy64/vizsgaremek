import express from "express";
import * as logController from "../controllers/logController.js";
import { verifyToken, isAdmin } from "../middleware/auth.js";

const router = express.Router();

router.get("/", verifyToken, isAdmin, logController.getAll);
router.get(
  "/foglalas/:foglalas_id",
  verifyToken,
  logController.getByFoglalasId,
);
router.get("/:id", verifyToken, logController.getById);
router.post("/", verifyToken, logController.create);
router.put("/:id", verifyToken, logController.update);
router.delete("/:id", verifyToken, logController.deleteLog);

export default router;
