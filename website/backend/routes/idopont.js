import express from "express";
import * as idopontController from "../controllers/idopontController.js";

const router = express.Router();

router.get("/eszkoz/:eszkoz_id", idopontController.getAvailableByDevice);
router.get("/:id", idopontController.getById);

export default router;
