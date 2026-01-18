import Circle from "../models/Circle.js";
import CircleRequest from "../models/CircleRequest.js";
import Post from "../models/CirclePost.js";
import Like from "../models/Like.js";

/**
 * Crear un círculo
 */
export const createCircle = async (req, res) => {
  try {
    const { name, description, category, image, color, icon, invitations } = req.body;
    const ownerId = req.user._id;

    const circle = new Circle({
      name,
      description,
      category,
      color,
      icon,
      ownerId,
      image: image || "https://i.ibb.co/4pDNDk1/default-circle.png",
      members: [ownerId],
    });

    await circle.save();

    if (Array.isArray(invitations) && invitations.length > 0) {
      for (let friendId of invitations) {
        const request = new CircleRequest({
          circleId: circle._id,
          inviterId: ownerId,
          inviteeId: friendId,
          status: "pending",
        });
        await request.save();
      }
    }

    res.status(201).json(circle);
  } catch (error) {
    console.error("Error al crear círculo:", error);
    res.status(500).json({ message: "Error al crear círculo", error });
  }
};

/**
 * Obtener círculos de un usuario
 */
export const getMyCircles = async (req, res) => {
  try {
    const userId = req.user._id;

    const circles = await Circle.find({ members: userId })
      .populate("ownerId", "firstName lastName email")
      .populate("members", "firstName lastName email");

    res.json(circles);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener círculos", error });
  }
};

/**
 * Obtener detalles de un círculo
 */
export const getCircleById = async (req, res) => {
  try {
    const { id } = req.params;

    const circle = await Circle.findById(id)
      .populate("ownerId", "firstName lastName email")
      .populate("members", "firstName lastName email");

    if (!circle) {
      return res.status(404).json({ message: "Círculo no encontrado" });
    }

    res.json(circle);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener círculo", error });
  }
};

/**
 * Eliminar un círculo
 */
export const deleteCircle = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const circle = await Circle.findById(id);

    if (!circle) {
      return res.status(404).json({ message: "Círculo no encontrado" });
    }

    if (circle.ownerId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "No tienes permiso para eliminar este círculo" });
    }

    await circle.deleteOne();
    res.json({ message: "Círculo eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar círculo", error });
  }
};

/**
 * Feed del usuario
 */
export const getUserFeed = async (req, res) => {
  try {
    const userId = req.user._id;

    const userCircles = await Circle.find({ members: userId }).select("_id");

    const posts = await Post.find({
      isActive: true,
      circle: { $in: userCircles.map(c => c._id) },
    })
      .populate("author", "firstName lastName profilePicture _id")
      .populate("circle", "name")
      .sort({ createdAt: -1 });

    const likedPosts = await Like.find({
      userId,
      postId: { $in: posts.map(p => p._id) },
    }).select("postId");

    const likedPostIds = new Set(likedPosts.map(l => l.postId.toString()));

    const postsWithLikes = posts.map(post => ({
      ...post.toObject(),
      isLiked: likedPostIds.has(post._id.toString()),
    }));

    res.json({
      userId,
      posts: postsWithLikes,
    });
  } catch (error) {
    console.error("Error obteniendo feed:", error);
    res.status(500).json({ message: "Error al obtener el feed" });
  }
};

export const addFriendsToCircle = async (req, res) => {
  try {
    const { id } = req.params;
    const { friends } = req.body;
    const inviterId = req.user._id;

    if (!Array.isArray(friends) || friends.length === 0) {
      return res.status(400).json({ message: "No se recibieron amigos para invitar" });
    }

    const circle = await Circle.findById(id);
    if (!circle) return res.status(404).json({ message: "Círculo no encontrado" });

    for (let inviteeId of friends) {
      const request = new CircleRequest({
        circleId: circle._id,
        inviterId,
        inviteeId,
        status: "pending",
      });
      await request.save();
    }

    res.json({ message: "Invitaciones enviadas correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al enviar invitaciones", error });
  }
};

export const updateCircle = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const circle = await Circle.findById(id);
    if (!circle) return res.status(404).json({ message: "Círculo no encontrado" });

    if (circle.ownerId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "No tienes permiso para editar este círculo" });
    }

    // Actualizar campos si vienen
    const { name, description } = req.body;
    if (name) circle.name = name;
    if (description) circle.description = description;

    // Actualizar imagen si viene
    if (req.file) {
      circle.image = `/uploads/${req.file.filename}`;
    }

    await circle.save();

    res.json(circle);
  } catch (error) {
    console.error("Error al actualizar círculo:", error);
    res.status(500).json({ message: "Error al actualizar círculo", error });
  }
};