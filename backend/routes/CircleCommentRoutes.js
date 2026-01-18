import express from "express";
import { getPostComments, createComment } from "../controllers/CircleCommentController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Todos los endpoints requieren autenticación
router.use(authenticateToken);

router.get("/:postId", getPostComments);
router.post("/:postId", createComment);

export default router;
