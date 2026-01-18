import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return res.status(401).json({ error: "Token de acceso requerido" });
    }

    // Permitir tanto "Bearer <token>" como token directo
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;

    if (!token) {
      return res.status(401).json({ error: "Token de acceso requerido" });
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Buscar usuario en DB
    const user = await User.findById(decoded.userId).select(
      "-password -__v"
    );

    if (!user) {
      return res.status(401).json({ error: "Usuario no encontrado" });
    }

    // Asignar usuario al request
    req.user = user;
    next();
  } catch (error) {
    console.error("❌ Error en autenticación:", error.message);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expirado" });
    }

    return res.status(403).json({ error: "Token inválido" });
  }
};
