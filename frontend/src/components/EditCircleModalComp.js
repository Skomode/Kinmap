import React, { useState, useRef } from "react";

const EditCircleModalComp = ({ isOpen, onClose, circle, onUpdated }) => {
  const [name, setName] = useState(circle?.name || "");
  const [description, setDescription] = useState(circle?.description || "");
  const [preview, setPreview] = useState(circle?.image || "");
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleImageClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // 1️⃣ Actualizar nombre y descripción
      const res = await fetch(
        `http://localhost:5000/api/circles/${circle._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name, description }),
        }
      );
      if (!res.ok) throw new Error("Error al actualizar círculo");
      let updatedCircle = await res.json();

      // 2️⃣ Subir imagen si hay
      if (imageFile) {
        const formData = new FormData();
        formData.append("image", imageFile);

        const resImg = await fetch(
          `http://localhost:5000/api/circles/${circle._id}/photo`,
          {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
          }
        );
        if (!resImg.ok) throw new Error("Error al subir imagen");
        updatedCircle = await resImg.json();
      }

      onUpdated(updatedCircle);
      onClose();
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("No se pudo actualizar el círculo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40"
      style={{ zIndex: 99999 }}
    >
      <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4 text-center">
          Editar círculo
        </h2>

        {/* Preview circular click-to-change */}
        <div className="flex flex-col items-center gap-2 mb-4">
          <div
            className="relative w-24 h-24 rounded-full overflow-hidden cursor-pointer group"
            onClick={handleImageClick}
          >
            <img
              src={preview || "https://i.ibb.co/4pDNDk1/default-circle.png"}
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

        {/* Nombre */}
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700">
            Nombre
          </label>
          <input
            type="text"
            className="w-full mt-1 p-2 border rounded-lg"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Descripción */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Descripción
          </label>
          <textarea
            className="w-full mt-1 p-2 border rounded-lg"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditCircleModalComp;
