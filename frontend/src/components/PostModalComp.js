import React, { useState, useEffect } from "react";
import {
  MapPin,
  Camera,
  Image,
  Users,
  Shield,
  AlertTriangle,
  X,
  Send,
  Smile,
  Paperclip,
  Eye,
} from "lucide-react";

const PostModalComp = ({
  onPostCreate,
  onClose,
  currentUser = { name: "María González", initials: "MG" },
  userLocation,
}) => {
  const [postContent, setPostContent] = useState("");
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [privacyLevel, setPrivacyLevel] = useState("family");
  const [isEmergency, setIsEmergency] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [currentLocation, setCurrentLocation] = useState("Detectando ubicación...");
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [isPosting, setIsPosting] = useState(false);

  const availableGroups = [
    { id: 1, name: "Familia", color: "bg-purple-500", members: 8 },
    { id: 2, name: "Trabajo", color: "bg-blue-500", members: 12 },
    { id: 3, name: "Amigos", color: "bg-green-500", members: 15 },
    { id: 4, name: "Universidad", color: "bg-yellow-500", members: 6 },
    { id: 5, name: "Emergencia", color: "bg-red-500", members: 3 },
  ];

  const privacyOptions = [
    {
      id: "family",
      name: "Solo familia",
      icon: Shield,
      description: "Solo tu círculo familiar",
      color: "text-green-600",
    },
    {
      id: "friends",
      name: "Amigos cercanos",
      icon: Users,
      description: "Familia y amigos de confianza",
      color: "text-blue-600",
    },
    {
      id: "all",
      name: "Todos mis círculos",
      icon: Eye,
      description: "Visible para todos tus contactos",
      color: "text-purple-600",
    },
  ];

  const toggleGroup = (groupId) => {
    setSelectedGroups((prev) =>
      prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]
    );
  };

  const handleMediaSelect = (type) => {
    const mediaTypes = {
      camera: { type: "photo", preview: "📷", name: "Foto desde cámara" },
      gallery: { type: "image", preview: "🖼️", name: "Imagen seleccionada" },
      file: { type: "file", preview: "📎", name: "Archivo adjunto" },
    };
    setSelectedMedia(mediaTypes[type]);
  };

  const handleCreatePost = async () => {
    if (!postContent.trim() && !selectedMedia) return;

    setIsPosting(true);

    const newPost = {
      id: Date.now(),
      author: currentUser,
      timestamp: "Ahora",
      location: locationEnabled && userLocation.latitude && userLocation.longitude
        ? `Lat: ${userLocation.latitude.toFixed(6)}, Lon: ${userLocation.longitude.toFixed(6)}`
        : null,
      content: postContent,
      media: selectedMedia,
      likes: 0,
      comments: 0,
      groups: availableGroups.filter((g) => selectedGroups.includes(g.id)),
      isLiked: false,
      isEmergency,
      privacyLevel,
    };

    setTimeout(() => {
      if (onPostCreate) onPostCreate(newPost);
      setIsPosting(false);
      resetForm();
      if (onClose) onClose();
    }, 1500);
  };

  const resetForm = () => {
    setPostContent("");
    setSelectedGroups([]);
    setPrivacyLevel("family");
    setIsEmergency(false);
    setLocationEnabled(true);
    setSelectedMedia(null);
  };

  // Actualizar la ubicación según userLocation
  useEffect(() => {
    if (userLocation.latitude && userLocation.longitude) {
      setCurrentLocation(
        `Latitud: ${userLocation.latitude.toFixed(6)}°, Longitud: ${userLocation.longitude.toFixed(6)}°`
      );
    } else if (userLocation.error) {
      setCurrentLocation("No se pudo obtener la ubicación");
    } else {
      setCurrentLocation("Detectando ubicación...");
    }
  }, [userLocation]);

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
      style={{ zIndex: 9999 }}
    >
      <div 
        className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        style={{ zIndex: 10000 }}
      >
        <div className="sticky top-0 z-50 bg-white flex items-center justify-between p-4 border-b border-gray-200 rounded-t-2xl">
          <h2 className="text-lg font-semibold text-gray-900">Crear publicación</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">{currentUser.initials}</span>
            </div>
            <div>
              <p className="font-semibold text-sm text-gray-900">{currentUser.name}</p>
              <p className="text-xs text-gray-500">Publicando ahora</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium text-red-700">Marcar como emergencia</span>
            </div>
            <button
              onClick={() => setIsEmergency(!isEmergency)}
              className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                isEmergency ? "bg-red-500" : "bg-gray-300"
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transform transition-transform duration-200 ${
                  isEmergency ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Contenido del post */}
          <div>
            <textarea
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder={
                isEmergency
                  ? "Describe tu situación de emergencia..."
                  : "¿Cómo estás? Comparte tu ubicación y estado con tus seres queridos..."
              }
              className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              maxLength={280}
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-500">{postContent.length}/280 caracteres</span>
              <button className="p-1 text-gray-400 hover:text-yellow-500">
                <Smile className="w-4 h-4" />
              </button>
            </div>
          </div>

          {selectedMedia && (
            <div className="border border-gray-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{selectedMedia.preview}</span>
                  <span className="text-sm text-gray-700">{selectedMedia.name}</span>
                </div>
                <button onClick={() => setSelectedMedia(null)} className="text-gray-400 hover:text-red-500">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          <div className="flex space-x-4">
            <button
              onClick={() => handleMediaSelect("camera")}
              className="flex items-center space-x-2 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
            >
              <Camera className="w-4 h-4" />
              <span>Cámara</span>
            </button>
            <button
              onClick={() => handleMediaSelect("gallery")}
              className="flex items-center space-x-2 px-3 py-2 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100"
            >
              <Image className="w-4 h-4" />
              <span>Galería</span>
            </button>
            <button
              onClick={() => handleMediaSelect("file")}
              className="flex items-center space-x-2 px-3 py-2 text-sm bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100"
            >
              <Paperclip className="w-4 h-4" />
              <span>Archivo</span>
            </button>
          </div>

          {/* Ubicación */}
          <div className="border border-gray-200 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-gray-700">Compartir ubicación</span>
              </div>
              <button
                onClick={() => setLocationEnabled(!locationEnabled)}
                className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                  locationEnabled ? "bg-blue-500" : "bg-gray-300"
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full transform transition-transform duration-200 ${
                    locationEnabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
            {locationEnabled && <p className="text-xs text-gray-500 ml-6">{currentLocation}</p>}
          </div>

          {/* Selección de grupos */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Compartir con círculos</span>
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {availableGroups.map((group) => (
                <button
                  key={group.id}
                  onClick={() => toggleGroup(group.id)}
                  className={`p-3 border-2 rounded-lg text-left transition-all ${
                    selectedGroups.includes(group.id)
                      ? "border-blue-300 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <div className={`w-3 h-3 rounded-full ${group.color}`}></div>
                    <span className="text-sm font-medium">{group.name}</span>
                  </div>
                  <p className="text-xs text-gray-500">{group.members} miembros</p>
                </button>
              ))}
            </div>
          </div>

          {/* Privacidad */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
              <Eye className="w-4 h-4" />
              <span>Nivel de privacidad</span>
            </h3>
            <div className="space-y-2">
              {privacyOptions.map((option) => {
                const IconComponent = option.icon;
                return (
                  <button
                    key={option.id}
                    onClick={() => setPrivacyLevel(option.id)}
                    className={`w-full p-3 border-2 rounded-lg text-left transition-all ${
                      privacyLevel === option.id ? "border-blue-300 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <IconComponent className={`w-4 h-4 ${option.color}`} />
                      <div>
                        <p className="text-sm font-medium">{option.name}</p>
                        <p className="text-xs text-gray-500">{option.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleCreatePost}
            disabled={(!postContent.trim() && !selectedMedia) || isPosting}
            className={`w-full py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2 ${
              (!postContent.trim() && !selectedMedia) || isPosting
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : isEmergency
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {isPosting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Publicando...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>{isEmergency ? "Enviar alerta" : "Publicar"}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostModalComp;