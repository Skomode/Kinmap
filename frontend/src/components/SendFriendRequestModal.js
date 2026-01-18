import React, { useState } from "react";
import { Plus, X, Users } from "lucide-react";

const SendFriendRequestModal = ({ isOpen, onClose, onSendRequest }) => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(
    "¡Hola! Me gustaría agregarte a mis contactos en Kinmap para compartir ubicaciones de forma segura."
  );
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setStatus("error");
      setErrorMessage("Por favor ingresa un correo electrónico.");
      return;
    }
    if (!validateEmail(email.trim())) {
      setStatus("error");
      setErrorMessage("Por favor ingresa un correo electrónico válido.");
      return;
    }

    setIsLoading(true);
    setStatus(null);
    setErrorMessage("");

    try {
      await onSendRequest({ email: email.trim(), message: message.trim() });
      setStatus("success");
      setTimeout(() => handleClose(), 2000);
    } catch (error) {
      setStatus("error");
      setErrorMessage(error.message || "Error al enviar la solicitud.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setMessage(
      "¡Hola! Me gustaría agregarte a mis contactos en Kinmap para compartir ubicaciones de forma segura."
    );
    setStatus(null);
    setErrorMessage("");
    setIsLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md relative z-[10000]">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Agregar Contacto
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Cerrar modal"
            disabled={isLoading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Correo electrónico del usuario *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status === "error") {
                  setStatus(null);
                  setErrorMessage("");
                }
              }}
              placeholder="usuario@ejemplo.com"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                status === "error" ? "border-red-300 bg-red-50" : "border-gray-300"
              }`}
              required
              disabled={isLoading}
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mensaje personalizado
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows="4"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
              disabled={isLoading}
              maxLength={500}
            />
            <div className="mt-1 text-xs text-gray-500 text-right">
              {message.length}/500 caracteres
            </div>
          </div>

          {status === "success" && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800">
              ¡Solicitud de amistad enviada correctamente!
            </div>
          )}
          {status === "error" && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800">
              {errorMessage}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || !email.trim()}
              className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg font-medium"
            >
              Enviar Solicitud
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SendFriendRequestModal;
