import React, { useState, useRef } from "react";

const EditProfileModalComp = ({ isOpen, onClose, currentUser }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [previewImage, setPreviewImage] = useState(
    currentUser?.profilePicture ||
      "https://i.ibb.co/4pDNDk1/default-circle.png"
  );
  const [selectedFile, setSelectedFile] = useState(null);

  const fileInputRef = useRef(null);

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

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const formData = new FormData();
    if (firstName) formData.append("firstName", firstName);
    if (lastName) formData.append("lastName", lastName);
    if (email) formData.append("email", email);
    if (selectedFile) formData.append("profilePicture", selectedFile);

    try {
      const res = await fetch("http://localhost:5000/api/users/update", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      if (!res.ok) throw new Error("Error al actualizar perfil");
      onClose();
      window.location.reload(); // Refresca la página al guardar cambios
    } catch (error) {
      console.error(error);
      alert("No se pudieron guardar los cambios");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold mb-4 text-center">
          Editar Perfil
        </h2>

        <div className="flex flex-col items-center space-y-4">
          {/* Vista previa de la imagen */}
          <div
            className="relative w-24 h-24 rounded-full overflow-hidden cursor-pointer group"
            onClick={handleImageClick}
          >
            <img
              src={previewImage}
              alt="Foto de perfil"
              className="w-full h-full object-cover"
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

          {/* Campos de texto */}
          <input
            type="text"
            placeholder={currentUser?.firstName || "Nombre"}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg text-sm"
          />
          <input
            type="text"
            placeholder={currentUser?.lastName || "Apellido"}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg text-sm"
          />

          {/* Botón guardar */}
          <button
            onClick={handleSave}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModalComp;
