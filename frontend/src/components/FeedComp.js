import React, { useState, useEffect } from "react";
import { Users, Heart, MessageCircle, Share2, Trash2, X, Pin, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import CreatePostComp from "./CreatePostComp";
import CirclesHeaderFeedComp from "./CirclesHeaderFeedComp";
import AddFriendModalComp from "./AddFriendModalComp";
import CommentItemComp from "./CommentItemComp";

const FeedComp = ({ filterCircle, currentUser, userLocation }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [postComments, setPostComments] = useState({});
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [modalImage, setModalImage] = useState(null);
  const [flippedPosts, setFlippedPosts] = useState({});
  const [isFollowSubmitting, setIsFollowSubmitting] = useState(false);

  const toggleFlip = (postId) => {
    setFlippedPosts((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const getProfilePicture = (author) => {
    if (!author?.profilePicture)
      return "https://i.ibb.co/4pDNDk1/default-circle.png";
    if (author.profilePicture.startsWith("http")) return author.profilePicture;
    return `http://localhost:5000/uploads/peoplePic/${author.profilePicture}`;
  };

  // ==================== Funciones agregadas ====================
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    if (diffInHours < 1) return "Hace unos minutos";
    if (diffInHours < 24) return `Hace ${diffInHours}h`;
    if (diffInHours < 48) return "Ayer";
    return date.toLocaleDateString();
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("¿Seguro que deseas eliminar este post?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/post-circles/posts/${postId}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Error al eliminar el post");
      setPosts((prev) => prev.filter((post) => post._id !== postId));
    } catch (err) {
      console.error(err);
      alert("No se pudo eliminar el post");
    }
  };
  // =============================================================

  const fetchFeedPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/circles/feed/mine", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error al cargar el feed");
      const data = await res.json();
      const postsData = data.posts || data;

      const filtered = filterCircle
        ? postsData.filter(
            (post) => String(post.circle?._id) === String(filterCircle._id)
          )
        : postsData;

      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      const postsWithFollow = filtered.map((post) => ({
        ...post,
        isLiked: post.isLiked || false,
        isFollowPost: post.type === "follow" && post.isFollowingActive,
        location:
          post.type === "follow" && post.isFollowingActive
            ? post.locationUpdates?.[post.locationUpdates.length - 1] || null
            : null,
      }));

      setPosts(postsWithFollow);

      filtered.forEach(async (post) => {
        try {
          const resComments = await fetch(
            `http://localhost:5000/api/circle-comments/${post._id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const commentsData = await resComments.json();
          const commentsWithProfile = commentsData.map((c) => ({
            ...c,
            authorId: {
              ...c.authorId,
              profilePicture: getProfilePicture(c.authorId),
            },
          }));
          setPostComments((prev) => ({
            ...prev,
            [post._id]: {
              comments: commentsWithProfile || [],
              show: false,
              newComment: "",
            },
          }));
        } catch (err) {
          console.error("Error cargando comentarios:", err);
        }
      });
    } catch (err) {
      console.error(err);
      setError("Error al cargar el feed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedPosts();
  }, [filterCircle]);

  useEffect(() => {
    const followPost = posts.find((p) => p.isFollowPost);
    if (!followPost) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setPosts((prevPosts) =>
          prevPosts.map((p) =>
            p.isFollowPost
              ? {
                  ...p,
                  location: {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                  },
                }
              : p
          )
        );
      },
      (err) => console.error(err),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [posts]);

  const handleStartFollow = async () => {
    if (!filterCircle) return;
    const message = prompt("Escribe tu mensaje de seguimiento:");
    if (!message) return;

    if (!userLocation?.latitude || !userLocation?.longitude) {
      alert("No se pudo obtener tu ubicación.");
      return;
    }

    try {
      setIsFollowSubmitting(true);
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/post-circles/circles/${filterCircle._id}/follow`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            content: message,
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
          }),
        }
      );
      if (!res.ok) throw new Error("Error creando post de seguimiento");
      fetchFeedPosts();
    } catch (err) {
      console.error(err);
      alert("No se pudo crear el post de seguimiento");
    } finally {
      setIsFollowSubmitting(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/like-post/posts/${postId}/like`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!res.ok) throw new Error("Error al dar like");
      const data = await res.json();
      setPosts((prev) =>
        prev.map((post) =>
          post._id === postId
            ? { ...post, isLiked: data.isLiked, likesCount: data.likesCount }
            : post
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const toggleComments = (postId) => {
    setPostComments((prev) => ({
      ...prev,
      [postId]: { ...prev[postId], show: !prev[postId]?.show },
    }));
  };

  const handleCommentChange = (postId, value) => {
    setPostComments((prev) => ({
      ...prev,
      [postId]: { ...prev[postId], newComment: value },
    }));
  };

  const submitComment = async (postId) => {
    const postData = postComments[postId];
    if (!postData?.newComment?.trim()) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/circle-comments/${postId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content: postData.newComment }),
        }
      );
      if (!res.ok) throw new Error("Error al enviar comentario");
      const newComment = await res.json();
      const newCommentWithAuthor = {
        ...newComment,
        authorId: {
          ...currentUser,
          profilePicture: getProfilePicture(currentUser),
        },
      };
      setPostComments((prev) => ({
        ...prev,
        [postId]: {
          ...prev[postId],
          comments: [...(prev[postId]?.comments || []), newCommentWithAuthor],
          newComment: "",
        },
      }));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p className="p-4 text-center">Cargando feed...</p>;
  if (error) return <p className="p-4 text-center text-red-600">{error}</p>;

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      {filterCircle && (
        <CirclesHeaderFeedComp
          circle={filterCircle}
          currentUser={currentUser}
          onCircleDeleted={() => console.log("Círculo eliminado")}
        />
      )}

      {filterCircle && (
        <CreatePostComp
          activeCircle={filterCircle}
          onPostCreated={fetchFeedPosts}
          currentUser={currentUser}
          userLocation={userLocation}
        />
      )}
      {posts.length === 0 && (
        <div className="bg-white p-6 rounded shadow text-center">
          <Users className="mx-auto w-16 h-16 text-gray-400 mb-2" />
          <p>No hay posts aún</p>
        </div>
      )}

      {posts.map((post) => {
        const currentUserId = currentUser?._id?.toString();
        const postAuthorId = post.author?._id?.toString();
        const circleOwnerId = post.circle?.ownerId?._id
          ? post.circle.ownerId._id.toString()
          : post.circle?.ownerId?.toString();
        const isAuthor = postAuthorId === currentUserId;
        const isAdmin = circleOwnerId === currentUserId;
        const postData = postComments[post._id] || {
          comments: [],
          show: false,
          newComment: "",
        };

        return (
          <div
            key={post._id}
            className={`relative rounded shadow hover:shadow-lg transition p-6 ${
              post.isFollowPost
                ? "bg-yellow-50 border-l-4 border-yellow-400"
                : "bg-white"
            }`}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <img
                  src={getProfilePicture(post.author)}
                  alt={post.author?.firstName || "Usuario"}
                  onError={(e) =>
                    (e.currentTarget.src =
                      "https://i.ibb.co/4pDNDk1/default-circle.png")
                  }
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium text-lg">
                    {isAuthor
                      ? "Yo"
                      : `${post.author?.firstName} ${post.author?.lastName}`}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Users className="w-3 h-3" />
                    {post.circle?.name}
                    <span>· {formatDate(post.createdAt)}</span>
                  </div>
                </div>
              </div>
              {(isAuthor || isAdmin) && (
                <button
                  onClick={() => handleDeletePost(post._id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Contenido de texto */}
            <p
              className={`mb-4 whitespace-pre-wrap ${
                post.isFollowPost
                  ? "text-yellow-800 font-semibold text-base"
                  : "text-gray-800"
              }`}
            >
              {post.content}
            </p>

            {console.log("link de media ", post.snapshotImage)}
            {/* Multimedia */}
            {post.mediaUrl && post.mediaUrl.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mb-4">
                {post.mediaUrl.map((fileUrl, idx) => {
                  const isImage = fileUrl.match(/\.(jpeg|jpg|png|gif)$/i);
                  const isVideo = fileUrl.match(/\.(mp4|webm|ogg)$/i);

                  return isImage ? (
                    <img
                      key={idx}
                      src={`http://localhost:5000${fileUrl}`}
                      alt={`media-${idx}`}
                      onClick={() =>
                        setModalImage(`http://localhost:5000${fileUrl}`)
                      }
                      className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-90"
                    />
                  ) : isVideo ? (
                    <video
                      key={idx}
                      src={`http://localhost:5000${fileUrl}`}
                      controls
                      className="w-full h-48 rounded-lg shadow"
                    />
                  ) : null;
                })}
              </div>
            )}

            {post.snapshotImage && (
              <div className="mb-4">
                <button
                  onClick={() =>
                    setModalImage(
                      post.snapshotImage.startsWith("http")
                        ? post.snapshotImage
                        : `http://localhost:5000${post.snapshotImage}`
                    )
                  }
                  className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
                >
                  <MapPin />
                </button>
              </div>
            )}

            {/* Mapa */}
            {post.isFollowPost &&
              post.location &&
              post.location.latitude != null &&
              post.location.longitude != null && (
                <div className="w-full h-64 mb-4 rounded-lg border-2 border-yellow-300 shadow-md overflow-hidden">
                  <MapContainer
                    key={`${post._id}-${post.location.latitude}-${post.location.longitude}`}
                    center={[post.location.latitude, post.location.longitude]}
                    zoom={15}
                    scrollWheelZoom={true}
                    className="w-full h-full"
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <Marker
                      position={[
                        post.location.latitude,
                        post.location.longitude,
                      ]}
                    >
                      <Popup>📍 Última ubicación reportada</Popup>
                    </Marker>
                  </MapContainer>
                </div>
              )}

            {/* Acciones */}
            <div className="flex items-center gap-6 text-sm text-gray-500 mb-2 mt-2">
              <button
                onClick={() => handleLike(post._id)}
                className={`flex items-center gap-1 ${
                  post.isLiked ? "text-red-500 font-medium" : ""
                }`}
              >
                <Heart
                  className={`w-5 h-5 ${
                    post.isLiked ? "fill-red-500 text-red-500" : ""
                  }`}
                />
                {post.likesCount || 0}
              </button>
              <button
                onClick={() => toggleComments(post._id)}
                className="flex items-center gap-1 hover:text-blue-600"
              >
                <MessageCircle className="w-5 h-5" />{" "}
                {postData.comments?.length || 0}
              </button>
              <button className="flex items-center gap-1 hover:text-blue-600">
                <Share2 className="w-5 h-5" /> Compartir
              </button>
            </div>

            {/* Comentarios */}
            {postData.show && (
              <div className="mt-3 space-y-2">
                {postData.comments.length > 0 ? (
                  postData.comments.map((comment) => (
                    <CommentItemComp
                      key={comment._id}
                      comment={comment}
                      currentUser={currentUser}
                    />
                  ))
                ) : (
                  <p className="text-gray-400 text-sm mb-2">
                    Sé el primero en comentar
                  </p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="text"
                    value={postData.newComment || ""}
                    onChange={(e) =>
                      handleCommentChange(post._id, e.target.value)
                    }
                    className="flex-1 border rounded px-2 py-1 text-sm"
                    placeholder="Escribe un comentario..."
                  />
                  <button
                    onClick={() => submitComment(post._id)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Enviar
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Modal de imagen */}
      <AnimatePresence>
        {modalImage && (
          <motion.div
            className="fixed inset-0 z-[9999] bg-black bg-opacity-80 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.img
              src={modalImage}
              alt="expanded"
              className="max-h-full max-w-full rounded-lg shadow-lg"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            />
            <button
              onClick={() => setModalImage(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300"
            >
              <X className="w-8 h-8" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de añadir amigos */}
      <AnimatePresence>
        {showAddFriendModal && (
          <AddFriendModalComp
            onClose={() => setShowAddFriendModal(false)}
            currentUser={currentUser}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default FeedComp;
