import express from "express";
import { getCurrentUser, updateCurrentUser } from "../controllers/UserController.js";
import { authenticateToken } from "../middleware/auth.js";
import uploadProfilePic from "../middleware/uploadProfile.js";

const router = express.Router();

router.get("/me", authenticateToken, getCurrentUser);

// PUT para actualizar usuario (foto + datos)
router.put("/update", authenticateToken, uploadProfilePic.single("profilePicture"), updateCurrentUser);

export default router;
