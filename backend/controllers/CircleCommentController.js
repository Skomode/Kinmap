import Comment from "../models/Comment.js";
import CirclePost from "../models/CirclePost.js";

// Función helper para concatenar la URL de la foto o asignar default
const setFullProfilePicture = (author) => {
  if (!author) {
    return {
      firstName: "Usuario",
      lastName: "",
      profilePicture: "https://i.ibb.co/4pDNDk1/default-circle.png",
    };
  }
  return {
    ...author.toObject ? author.toObject() : author,
    profilePicture: author.profilePicture
      ? `${process.env.BACKEND_URL}/uploads/peoplePic/${author.profilePicture}`
      : "https://i.ibb.co/4pDNDk1/default-circle.png",
  };
};

export const getPostComments = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await CirclePost.findById(postId);
    if (!post || !post.isActive)
      return res.status(404).json({ message: "Post no encontrado" });

    let comments = await Comment.find({ postId, isActive: true })
      .populate("authorId", "firstName lastName profilePicture")
      .sort({ createdAt: 1 });

    // Aplicar URL completa a cada autor
    comments = comments.map((comment) => ({
      ...comment.toObject(),
      authorId: setFullProfilePicture(comment.authorId),
    }));

    res.json(comments);
  } catch (error) {
    console.error("Error obteniendo comentarios:", error);
    res.status(500).json({ message: "Error al obtener comentarios", error: error.message });
  }
};

export const createComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content, parentCommentId } = req.body;

    if (!content || content.trim() === "")
      return res.status(400).json({ message: "El comentario no puede estar vacío" });

    const post = await CirclePost.findById(postId);
    if (!post || !post.isActive)
      return res.status(404).json({ message: "Post no encontrado" });

    const comment = new Comment({
      postId,
      authorId: req.user._id,
      content: content.trim(),
      parentCommentId: parentCommentId || null,
    });

    await comment.save();
    await comment.populate("authorId", "firstName lastName profilePicture");

    // Aplicar URL completa al autor del comentario
    const commentWithAuthor = {
      ...comment.toObject(),
      authorId: setFullProfilePicture(comment.authorId),
    };

    // Actualizar contador de comentarios en el post
    post.commentsCount = (post.commentsCount || 0) + 1;
    await post.save();

    res.status(201).json(commentWithAuthor);
  } catch (error) {
    console.error("Error creando comentario:", error);
    res.status(500).json({ message: "Error al crear comentario", error: error.message });
  }
};
