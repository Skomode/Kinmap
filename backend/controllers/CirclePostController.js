import CirclePost from "../models/CirclePost.js";
import Circle from "../models/Circle.js";
import multer from "multer";
import { generateSnapshotUrl } from "../utils/generateSnapshotUrl.js";

// Configuración de multer (guardar en disco en carpeta uploads/)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

export const upload = multer({ storage });

// Función que concatena la URL completa de profilePicture
const setFullProfilePicture = (author) => {
  if (!author) return;
  author.profilePicture = author.profilePicture
    ? `${process.env.BACKEND_URL}/uploads/${author.profilePicture}`
    : null;
};

/**
 * Crear un post en un círculo
 */
export const createCirclePost = async (req, res) => {
  try {
    const { circleId } = req.params;
    const { type, content, title, location, latitude, longitude } = req.body;

    if (!type || !content || content.trim() === "") {
      return res
        .status(400)
        .json({ message: "Tipo y contenido son requeridos" });
    }

    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Usuario no autenticado" });
    }

    const circle = await Circle.findById(circleId);
    if (!circle)
      return res.status(404).json({ message: "Círculo no encontrado" });
    if (!circle.members.includes(req.user._id)) {
      return res
        .status(403)
        .json({ message: "No eres miembro de este círculo" });
    }

    // 📁 Archivos multimedia
    let mediaUrl;
    if (req.files?.media) {
      mediaUrl = req.files.media.map((f) => `/uploads/${f.filename}`);
    }

    // 📍 Generar snapshot del mapa automáticamente si hay latitud y longitud
    let snapshotImage = null;
    if (latitude && longitude) {
      try {
        snapshotImage = await generateSnapshotUrl(latitude, longitude);
      } catch (err) {
        console.error("Error generando snapshot:", err);
      }
    }

    const post = new CirclePost({
      circle: circle._id,
      author: req.user._id,
      type,
      content: content.trim(),
      title: title ? title.trim() : undefined,
      mediaUrl: mediaUrl || undefined,
      visibility: "circle_only",
      likesCount: 0,
      commentsCount: 0,
      location: location || "Ubicación desconocida",
      latitude: latitude || null,
      longitude: longitude || null,
      snapshotImage: snapshotImage || null,
    });

    await post.save();

    // Poblar autor y círculo
    await post.populate("author", "firstName lastName profilePicture");
    await post.populate({
      path: "circle",
      select: "name description ownerId",
      populate: { path: "ownerId", select: "firstName lastName _id" },
    });

    setFullProfilePicture(post.author);

    res.status(201).json({ message: "Post creado exitosamente", post });
  } catch (error) {
    console.error("Error creando post:", error);
    res
      .status(500)
      .json({ message: "Error al crear el post", error: error.message });
  }
};

/**
 * Obtener todos los posts de un círculo con paginación
 */
export const getCirclePosts = async (req, res) => {
  try {
    const { circleId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const circle = await Circle.findById(circleId);
    if (!circle)
      return res.status(404).json({ message: "Círculo no encontrado" });

    if (!circle.members.includes(req.user._id)) {
      return res
        .status(403)
        .json({ message: "No eres miembro de este círculo" });
    }

    const posts = await CirclePost.find({ circle: circleId, isActive: true })
      .populate("author", "firstName lastName profilePicture")
      .populate({
        path: "circle",
        select: "name description ownerId",
        populate: { path: "ownerId", select: "firstName lastName _id" },
      })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await CirclePost.countDocuments({
      circle: circleId,
      isActive: true,
    });

    // Concatenar URL de todas las fotos de autor
    posts.forEach((post) => setFullProfilePicture(post.author));

    res.json({
      posts,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalPosts: total,
      },
    });
  } catch (error) {
    console.error("Error obteniendo posts:", error);
    res
      .status(500)
      .json({ message: "Error al obtener los posts", error: error.message });
  }
};

/**
 * Obtener un post específico
 */
export const getCirclePost = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await CirclePost.findById(postId)
      .populate("author", "firstName lastName profilePicture")
      .populate({
        path: "circle",
        select: "name description ownerId",
        populate: { path: "ownerId", select: "firstName lastName _id" },
      });

    if (!post || !post.isActive)
      return res.status(404).json({ message: "Post no encontrado" });

    setFullProfilePicture(post.author);

    res.json(post);
  } catch (error) {
    console.error("Error obteniendo post:", error);
    res
      .status(500)
      .json({ message: "Error al obtener el post", error: error.message });
  }
};

/**
 * Actualizar un post (solo el autor)
 */
export const updateCirclePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content, title, mediaUrl, visibility, location } = req.body;

    const post = await CirclePost.findById(postId);
    if (!post || !post.isActive)
      return res.status(404).json({ message: "Post no encontrado" });

    if (post.author.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Solo puedes editar tus propios posts" });
    }

    if (content) post.content = content.trim();
    if (title) post.title = title.trim();
    if (mediaUrl) post.mediaUrl = mediaUrl;
    if (visibility) post.visibility = visibility;
    if (location) post.location = location;

    post.updatedAt = new Date();
    await post.save();

    await post.populate("author", "firstName lastName profilePicture");
    await post.populate({
      path: "circle",
      select: "name description ownerId",
      populate: { path: "ownerId", select: "firstName lastName _id" },
    });

    setFullProfilePicture(post.author);

    res.json({ message: "Post actualizado exitosamente", post });
  } catch (error) {
    console.error("Error actualizando post:", error);
    res
      .status(500)
      .json({ message: "Error al actualizar el post", error: error.message });
  }
};

/**
 * Eliminar un post por postId (solo autor o admin)
 */
export const deleteCirclePostById = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await CirclePost.findById(postId);
    if (!post || !post.isActive)
      return res.status(404).json({ message: "Post no encontrado" });

    const circle = await Circle.findById(post.circle);
    if (!circle)
      return res
        .status(404)
        .json({ message: "Círculo del post no encontrado" });

    const isAuthor = post.author.toString() === req.user._id.toString();
    const isAdmin = circle.ownerId.toString() === req.user._id.toString();

    if (!isAuthor && !isAdmin) {
      return res
        .status(403)
        .json({ message: "No tienes permiso para eliminar este post" });
    }

    post.isActive = false;
    await post.save();

    res.json({ message: "Post eliminado correctamente" });
  } catch (error) {
    console.error("Error eliminando post:", error);
    res
      .status(500)
      .json({ message: "Error al eliminar el post", error: error.message });
  }
};

export const createFollowPost = async (req, res) => {
  try {
    const { circleId } = req.params;
    const { content, latitude, longitude } = req.body;

    if (!content || content.trim() === "") {
      return res
        .status(400)
        .json({ message: "El contenido es obligatorio" });
    }

    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Usuario no autenticado" });
    }

    const circle = await Circle.findById(circleId);
    if (!circle)
      return res.status(404).json({ message: "Círculo no encontrado" });

    if (!circle.members.includes(req.user._id)) {
      return res
        .status(403)
        .json({ message: "No eres miembro de este círculo" });
    }

    const post = new CirclePost({
      circle: circle._id,
      author: req.user._id,
      type: "follow",
      content: content.trim(),
      latitude: latitude || null,
      longitude: longitude || null,
      isFollowingActive: true,
      locationUpdates: latitude && longitude ? [
        { lat: latitude, lng: longitude }
      ] : [],
      visibility: "circle_only",
      likesCount: 0,
      commentsCount: 0,
    });

    await post.save();

    await post.populate("author", "firstName lastName profilePicture");
    await post.populate({
      path: "circle",
      select: "name description ownerId",
      populate: { path: "ownerId", select: "firstName lastName _id" },
    });

    setFullProfilePicture(post.author);

    res.status(201).json({ message: "Post de seguimiento creado", post });
  } catch (error) {
    console.error("Error creando post de seguimiento:", error);
    res.status(500).json({
      message: "Error al crear el post de seguimiento",
      error: error.message,
    });
  }
};

