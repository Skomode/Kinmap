import mongoose from "mongoose";
import Like from "../models/Like.js";
import CirclePost from "../models/CirclePost.js";

/**
 * Dar o quitar like a un post
 */
export const toggleLike = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    // Buscar post y popular círculo
    const post = await CirclePost.findById(postId).populate("circle");
    if (!post || !post.isActive) {
      return res.status(404).json({ message: "Post no encontrado" });
    }

    // Verificar que el usuario pertenece al círculo
    const isMember = post.circle.members.some(
      (memberId) => memberId.toString() === userId.toString()
    );
    if (!isMember) {
      return res.status(403).json({ message: "No tienes acceso a este post" });
    }

    // Buscar si ya existe el like
    const existingLike = await Like.findOne({ postId, userId });

    if (existingLike) {
      // QUITAR LIKE
      await Like.deleteOne({ _id: existingLike._id });

      post.likesCount = Math.max(0, post.likesCount - 1);
      await post.save();

      return res.json({
        message: "Like removido",
        isLiked: false, // 👈 cambiamos a isLiked
        likesCount: post.likesCount,
      });
    }

    // AGREGAR LIKE
    const newLike = new Like({ postId, userId });
    await newLike.save();

    post.likesCount += 1;
    await post.save();

    res.json({
      message: "Like agregado",
      isLiked: true, // 👈 cambiamos a isLiked
      likesCount: post.likesCount,
    });
  } catch (error) {
    console.error("Error en toggle like:", error);
    if (error.code === 11000) {
      return res.status(409).json({ message: "Ya has dado like a este post" });
    }
    res.status(500).json({ message: "Error interno del servidor", error: error.message });
  }
};

/**
 * Obtener usuarios que dieron like a un post
 */
export const getPostLikes = async (req, res) => {
  try {
    const { postId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const userId = req.user._id;

    const post = await CirclePost.findById(postId).populate("circle");
    if (!post || !post.isActive) {
      return res.status(404).json({ message: "Post no encontrado" });
    }

    const isMember = post.circle.members.some(
      (memberId) => memberId.toString() === userId.toString()
    );
    if (!isMember) {
      return res.status(403).json({ message: "No tienes acceso a este post" });
    }

    const likes = await Like.find({ postId })
      .populate("userId", "firstName lastName profilePicture")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Like.countDocuments({ postId });

    res.json({
      likes: likes.map((like) => ({
        id: like._id,
        user: like.userId,
        likedAt: like.createdAt,
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalLikes: total,
      },
    });
  } catch (error) {
    console.error("Error obteniendo likes:", error);
    res.status(500).json({ message: "Error al obtener los likes", error: error.message });
  }
};

/**
 * Verificar si el usuario actual dio like a un post
 */
export const checkUserLike = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    const like = await Like.findOne({ postId, userId });

    res.json({
      liked: !!like,
      likedAt: like?.createdAt || null,
    });
  } catch (error) {
    console.error("Error verificando like:", error);
    res.status(500).json({ message: "Error al verificar like", error: error.message });
  }
};

/**
 * Obtener estadísticas de likes de un usuario
 */
export const getUserLikeStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const totalLikesGiven = await Like.countDocuments({ userId });

    const totalLikesReceived = await Like.aggregate([
      {
        $lookup: {
          from: "circleposts",
          localField: "postId",
          foreignField: "_id",
          as: "post",
        },
      },
      { $unwind: "$post" },
      { $match: { "post.author": new mongoose.Types.ObjectId(userId) } },
      { $count: "totalLikesReceived" },
    ]);

    res.json({
      likesGiven: totalLikesGiven,
      likesReceived: totalLikesReceived[0]?.totalLikesReceived || 0,
    });
  } catch (error) {
    console.error("Error obteniendo estadísticas:", error);
    res.status(500).json({ message: "Error al obtener estadísticas", error: error.message });
  }
};

export const getUserFeed = async (req, res) => {
  try {
    const userId = req.user._id;

    // Buscar los círculos a los que pertenece el usuario
    const circles = await Circle.find({ members: userId }).select("_id name description");
    const circleIds = circles.map(c => c._id);

    // Buscar posts de esos círculos
    const posts = await Post.find({ circle: { $in: circleIds } })
      .populate("author", "username firstName lastName email")
      .populate("circle", "name description")
      .sort({ createdAt: -1 })
      .lean(); // 👈 importante: convierte en objeto plano

    // Sacar todos los IDs de los posts
    const postIds = posts.map(p => p._id);

    // Buscar qué posts ya tienen like de este usuario
    const userLikes = await Like.find({ postId: { $in: postIds }, userId }).select("postId");
    const likedPostIds = new Set(userLikes.map(like => like.postId.toString()));

    // Agregar isLiked a cada post
    const postsWithLikeFlag = posts.map(post => ({
      ...post,
      isLiked: likedPostIds.has(post._id.toString()),
    }));

    res.json(postsWithLikeFlag);
  } catch (error) {
    console.error("Error en getUserFeed:", error);
    res.status(500).json({ message: "Error al obtener el feed", error });
  }
};