import express from "express";
import * as idopontController from "../controllers/idopontController.js";
import { verifyToken, isAdmin } from "../middleware/auth.js";

const router = express.Router();

router.get("/eszkoz/:eszkoz_id", idopontController.getAvailableByDevice);
router.get("/", verifyToken, isAdmin, idopontController.getAll);
router.get("/:id", idopontController.getById);
router.post("/", verifyToken, isAdmin, idopontController.create);
router.put("/:id", verifyToken, isAdmin, idopontController.update);
router.delete("/:id", verifyToken, isAdmin, idopontController.deleteIdopont);

export default router;
