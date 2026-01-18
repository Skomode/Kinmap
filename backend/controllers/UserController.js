import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();

// GET - Obtener usuario autenticado
export const getCurrentUser = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Usuario no autenticado" });

    const { password, __v, ...userData } = req.user.toObject();

    // Construir URL completa de la imagen de perfil
    if (userData.profilePicture) {
      userData.profilePicture = `${process.env.BACKEND_URL}/uploads/peoplePic/${userData.profilePicture}`;
    }

    res.json(userData);
  } catch (error) {
    console.error("Error obteniendo usuario:", error);
    res.status(500).json({ error: "Error obteniendo usuario" });
  }
};

// PUT - Actualizar usuario autenticado
export const updateCurrentUser = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Usuario no autenticado" });

    const user = req.user;
    const { firstName, lastName, email } = req.body;

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;

    // Manejar nueva foto de perfil
    if (req.file) {
      user.profilePicture = req.file.filename; // Solo nombre del archivo
    }

    await user.save();

    const { password, __v, ...updatedUser } = user.toObject();

    if (updatedUser.profilePicture) {
      updatedUser.profilePicture = `${process.env.BACKEND_URL}/uploads/peoplePic/${updatedUser.profilePicture}`;
    }

    res.json(updatedUser);
  } catch (error) {
    console.error("Error actualizando usuario:", error);
    res.status(500).json({ error: "Error actualizando usuario" });
  }
};
