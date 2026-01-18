import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import {
  createCirclePost,
  getCirclePosts,
  getCirclePost,
  updateCirclePost,
  deleteCirclePostById,
  upload, // 👈 exportado desde el controlador
  createFollowPost, // 👈 nuevo controlador para posts de seguimiento
} from "../controllers/CirclePostController.js";

const router = express.Router();

// Crear post en círculo con soporte para multimedia
router.post(
  "/circles/:circleId/posts",
  authenticateToken,
  upload.fields([
    { name: "media", maxCount: 10 }, // archivos multimedia
    { name: "snapshot", maxCount: 1 }, // snapshot del mapa
  ]),
  createCirclePost
);

// 🆕 Crear post de tipo "follow" (seguimiento en tiempo real)
router.post(
  "/circles/:circleId/follow",
  authenticateToken,
  createFollowPost
);

// Obtener posts de un círculo
router.get("/circles/:circleId/posts", authenticateToken, getCirclePosts);

// Obtener un post específico
router.get("/posts/:postId", authenticateToken, getCirclePost);

// Actualizar un post
router.put("/posts/:postId", authenticateToken, updateCirclePost);

// Eliminar un post (solo por postId)
router.delete("/posts/:postId", authenticateToken, deleteCirclePostById);

export default router;
