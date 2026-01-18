import express from "express";
import {
  createCircle,
  getMyCircles,
  getCircleById,
  deleteCircle,
  getUserFeed,
  addFriendsToCircle,
  updateCircle
} from "../controllers/CircleController.js";
import upload from "../middleware/upload.js";
import { authenticateToken } from "../middleware/auth.js";
import Circle from "../models/Circle.js";

const router = express.Router();

// Middleware para autenticación
router.use(authenticateToken);

// Rutas de círculo
router.post("/", createCircle);

router.get("/mine", getMyCircles);

router.get("/feed/mine", getUserFeed);

router.get("/:id", getCircleById);

router.delete("/:id", deleteCircle);

router.post("/:id/add-friends", addFriendsToCircle);

router.put("/:id", updateCircle); // Actualiza nombre y descripción

// Ruta para actualizar foto del círculo
router.put("/:id/photo", upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Buscar el círculo
    const circle = await Circle.findById(id);
    if (!circle) return res.status(404).json({ message: "Círculo no encontrado" });

    // Verificar que el usuario es dueño
    if (circle.ownerId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "No tienes permiso para editar este círculo" });
    }

    // Guardar la ruta de la imagen en la DB
    // 🔹 Aquí se asegura que sea relativa a /uploads
    circle.image = `/uploads/${req.file.filename}`;
    await circle.save();

    res.json(circle);
  } catch (error) {
    console.error("Error al subir foto:", error);
    res.status(500).json({ message: "Error al subir foto", error });
  }
});

export default router;
