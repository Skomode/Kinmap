import React, { useState, useEffect, useRef } from "react";
import { X, PlusCircle } from "lucide-react";
import axios from "axios";

const CreateCircleModalComp = ({ isOpen, onClose, setCircles, friends }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [previewImage, setPreviewImage] = useState("https://i.ibb.co/4pDNDk1/default-circle.png");
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleImageClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreviewImage(reader.result);
    reader.readAsDataURL(file);
  };

  const toggleSelectFriend = (id) => {
    setSelectedFriends((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const handleCreateCircle = async () => {
    if (!name.trim()) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // 1️⃣ Crear círculo sin imagen
      const res = await axios.post(
        "http://localhost:5000/api/circles",
        {
          name,
          description,
          category,
          invitations: selectedFriends,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      let newCircle = res.data;

      // 2️⃣ Subir imagen si hay
      if (selectedFile) {
        const formData = new FormData();
        formData.append("image", selectedFile);

        const resImg = await axios.put(
          `http://localhost:5000/api/circles/${newCircle._id}/photo`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        newCircle = resImg.data;
      }

      setCircles((prev) => [newCircle, ...prev]);

      // 🔄 Recargar la página al crear el círculo
      window.location.reload();

    } catch (err) {
      console.error(err);
      alert("Error al crear el círculo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      ></div>

      <div className="relative bg-white w-full max-w-md rounded-2xl shadow-xl p-6 z-[10000]">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <PlusCircle className="w-5 h-5 text-blue-600" />
          Crear nuevo círculo
        </h2>

        {/* Preview de imagen circular click-to-change */}
        <div className="flex flex-col items-center mb-4">
          <div
            className="relative w-24 h-24 rounded-full overflow-hidden cursor-pointer group"
            onClick={handleImageClick}
          >
            <img
              src={previewImage}
              alt="Preview"
              className="w-full h-full object-cover border"
            />
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
              <span className="text-white text-sm">Cambiar</span>
            </div>
          </div>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageChange}
            className="hidden"
          />
        </div>

        <div className="space-y-3">
          <input
            type="text"
            placeholder="Nombre del círculo *"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Etiqueta/Categoría (opcional)"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
          <textarea
            placeholder="Descripción (opcional)"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
            rows="3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {friends.length > 0 && (
          <div className="mt-4 max-h-64 overflow-y-auto pr-2 space-y-2">
            <p className="text-gray-600 font-medium mb-2">Invitar amigos</p>
            {friends.map((friend) => {
              const isSelected = selectedFriends.includes(friend._id);
              return (
                <div
                  key={friend._id}
                  onClick={() => toggleSelectFriend(friend._id)}
                  className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-blue-50 border border-blue-300"
                      : "hover:bg-gray-50 border border-gray-200"
                  }`}
                >
                  <div
                    className={`w-5 h-5 flex items-center justify-center rounded-full border-2 ${
                      isSelected
                        ? "bg-blue-600 border-blue-600"
                        : "border-gray-400"
                    }`}
                  >
                    {isSelected && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-3 h-3 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{friend.name}</p>
                    <p className="text-sm text-gray-500">{friend.email}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700"
          >
            Cancelar
          </button>
          <button
            onClick={handleCreateCircle}
            disabled={!name.trim() || loading}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
          >
            {loading ? "Creando..." : "Crear círculo"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateCircleModalComp;
