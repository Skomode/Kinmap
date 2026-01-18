import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Configuración de ES Modules para __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

// Configuración de CORS
app.use(
  cors({
    origin: "http://localhost:3000", // dominio del frontend
    credentials: true,
  })
);

// Carpeta pública para subir archivos
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Parseo de JSON
app.use(express.json());

// Importar rutas
import authRoutes from "./routes/authRoutes.js";
import FriendRequestRoutes from "./routes/FriendRequestRoutes.js";
import FriendShipRoutes from "./routes/FriendShipRoutes.js";
import CircleRoutes from "./routes/CircleRoutes.js";
import CircleRequestRoutes from "./routes/CircleRequestRoutes.js";
import PostRoutes from "./routes/PostRoutes.js";
import LikePostRoutes from "./routes/LikePostRoutes.js";
import CircleCommentRoutes from "./routes/CircleCommentRoutes.js";
import UserRoutes from "./routes/UserRoutes.js";

// Usar rutas
app.use("/api/circle-comments", CircleCommentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/friend-requests", FriendRequestRoutes);
app.use("/api/friends", FriendShipRoutes);
app.use("/api/circles", CircleRoutes);
app.use("/api/circle-requests", CircleRequestRoutes);
app.use("/api/post-circles", PostRoutes);
app.use("/api/like-post", LikePostRoutes);
app.use("/api/users", UserRoutes);
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads", "circlesPic"))
);

// Conexión a MongoDB y arranque del servidor
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Conectado a MongoDB");
    app.listen(process.env.PORT, () => {
      console.log(`🚀 Servidor corriendo en puerto ${process.env.PORT}`);
    });
  })
  .catch((err) => console.error("❌ Error al conectar a MongoDB:", err));
