import React, { useState, useEffect } from "react";
import { Image, X, MapPin } from "lucide-react";
import axios from "axios";

const CreatePostComp = ({
  activeCircle,
  onPostCreated,
  currentUser,
  userLocation,
}) => {
  const [content, setContent] = useState("");
  const [mediaFiles, setMediaFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userLocationPost, setUserLocationPost] = useState(
    "Obteniendo ubicación..."
  );
  const [isFollowing, setIsFollowing] = useState(false);
  const [followPostId, setFollowPostId] = useState(null);
  const circleId = activeCircle?._id;

  const maxSize = 10 * 1024 * 1024; // 10MB
  const validTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "video/mp4",
    "video/webm",
  ];

  // obtener ubicación por IP
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const res = await fetch("http://ip-api.com/json/?lang=es");
        const data = await res.json();
        setUserLocationPost(
          data.status === "success"
            ? data.city || data.regionName || "Ubicación desconocida"
            : "Ubicación desconocida"
        );
      } catch {
        setUserLocationPost("Ubicación desconocida");
      }
    };
    fetchLocation();
  }, []);

  // actualiza en tiempo real la posición del post de seguimiento
  useEffect(() => {
    let watchId;
    if (isFollowing && followPostId) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const coords = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          };
          axios
            .put(
              `http://localhost:5000/api/posts/${followPostId}/location`,
              coords
            )
            .catch(console.error);
        },
        console.error,
        { enableHighAccuracy: true }
      );
    }
    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [isFollowing, followPostId]);

  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = [];
    files.forEach((file) => {
      if (!validTypes.includes(file.type)) {
        alert(`Tipo de archivo no permitido: ${file.name}`);
      } else if (file.size > maxSize) {
        alert(`Archivo muy grande (máx 10MB): ${file.name}`);
      } else {
        validFiles.push(file);
      }
    });
    setMediaFiles((prev) => [...prev, ...validFiles]);
  };

  const removeMedia = (index) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!content.trim() && mediaFiles.length === 0) return;
    if (!circleId) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const formData = new FormData();
      const hasVideo = mediaFiles.some((f) => f.type.startsWith("video/"));
      const hasImage = mediaFiles.some((f) => f.type.startsWith("image/"));

      formData.append("type", hasVideo ? "video" : hasImage ? "image" : "text");
      formData.append("content", content);
      formData.append("location", userLocationPost || "Ubicación desconocida");
      if (userLocation?.latitude && userLocation?.longitude) {
        formData.append("latitude", userLocation.latitude);
        formData.append("longitude", userLocation.longitude);
      }

      mediaFiles.forEach((file) => formData.append("media", file));

      const response = await axios.post(
        `http://localhost:5000/api/post-circles/circles/${circleId}/posts`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setContent("");
      setMediaFiles([]);
      onPostCreated && onPostCreated(response.data.post);
    } catch (error) {
      console.error(error.response || error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFollow = async () => {
    if (!circleId) return;

    if (isFollowing) {
      // terminar seguimiento
      try {
        await axios.delete(`http://localhost:5000/api/posts/${followPostId}`);
        setIsFollowing(false);
        setFollowPostId(null);
      } catch (err) {
        console.error(err);
      }
    } else {
      // iniciar seguimiento
      try {
        const token = localStorage.getItem("token");
        const res = await axios.post(
          `http://localhost:5000/api/post-circles/circles/${circleId}/follow`,
          {
            content: content.trim() || "Siguiendo en tiempo real...",
            latitude: userLocation?.latitude || null,
            longitude: userLocation?.longitude || null,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setIsFollowing(true);
        setFollowPostId(res.data.post._id);
        onPostCreated && onPostCreated(res.data.post);
        setContent(""); // opcional: limpiar contenido al iniciar seguimiento
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      {/* Usuario + ubicación */}
      <div className="flex items-start gap-3 mb-3">
        <img
          src={
            currentUser?.profilePicture ||
            "https://i.ibb.co/4pDNDk1/default-circle.png"
          }
          alt="user"
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="flex-1">
          <p className="font-medium text-gray-800">Yo</p>
          <div className="flex items-center gap-1 text-sm text-blue-700 mt-1">
            <MapPin className="w-4 h-4" />
            <span>{userLocationPost}</span>
          </div>
          <input
            type="text"
            placeholder={`¿Qué estás pensando, ${
              currentUser?.firstName || "usuario"
            }?`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full border rounded-full px-4 py-2 bg-gray-100 focus:outline-none mt-2"
          />
        </div>
      </div>

      {/* Previsualización de media */}
      {mediaFiles.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-3">
          {mediaFiles.map((file, index) => (
            <div key={index} className="relative">
              {file.type.startsWith("image/") ? (
                <img
                  src={URL.createObjectURL(file)}
                  alt={`preview-${index}`}
                  className="w-full h-24 object-cover rounded-lg"
                />
              ) : (
                <video
                  src={URL.createObjectURL(file)}
                  controls
                  className="w-full h-32 object-cover rounded-lg"
                />
              )}
              <button
                type="button"
                onClick={() => removeMedia(index)}
                className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* botones */}
      <div className="flex items-center justify-between mt-2">
        <label className="cursor-pointer hover:text-blue-600 flex items-center gap-1 text-gray-600">
          <Image className="w-5 h-5" />
          <input
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleMediaChange}
            className="hidden"
          />
        </label>

        <div className="flex gap-2">
          <button
            onClick={handleToggleFollow}
            className={`px-4 py-2 rounded text-white ${
              isFollowing
                ? "bg-red-500 hover:bg-red-600"
                : "bg-yellow-500 hover:bg-yellow-600"
            }`}
          >
            {isFollowing ? "Terminar seguimiento" : "Iniciar seguimiento"}
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading || (!content.trim() && mediaFiles.length === 0)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? "Publicando..." : "Publicar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePostComp;
