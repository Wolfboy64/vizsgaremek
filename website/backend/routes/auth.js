import express from "express";
import * as authController from "../controllers/authController.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/google/start", authController.startGoogleOAuth);
router.get("/google/callback", authController.handleGoogleOAuthCallback);
router.get("/github/start", authController.startGitHubOAuth);
router.get("/github/callback", authController.handleGitHubOAuthCallback);
router.get("/me", verifyToken, authController.getProfile);
router.put("/me", verifyToken, authController.updateOwnProfile);

export default router;
