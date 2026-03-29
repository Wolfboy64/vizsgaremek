import express from "express";
import * as ertekelesController from "../controllers/ertekelesController.js";
import * as mentorErtekelesController from "../controllers/mentorErtekelesController.js";
import { verifyToken, isAdmin } from "../middleware/auth.js";

const router = express.Router();

router.get("/", verifyToken, isAdmin, ertekelesController.getAll);
router.get(
  "/mentor/:mentor_id/atlag",
  verifyToken,
  mentorErtekelesController.getMentorAtlag,
);
router.get(
  "/mentor/foglalas/:foglalas_id",
  verifyToken,
  mentorErtekelesController.getMentorErtekelesByFoglalas,
);
router.post("/mentor", verifyToken, mentorErtekelesController.upsertMentorErtekeles);
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
