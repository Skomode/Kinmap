import React, { useState, useEffect } from "react";
import axios from "axios";
import { X } from "lucide-react";

const AddFriendModalComp = ({ isOpen, onClose, circleId, friends }) => {
  const [availableFriends, setAvailableFriends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !circleId) return;

    const fetchPending = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        // 1. Traer las invitaciones pendientes de este círculo
        const res = await axios.get(
          `http://localhost:5000/api/circle-requests/pending/${circleId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const pendingIds = res.data.map((inv) => inv.inviteeId.toString());

        // 2. Filtrar amigos que no estén pendientes
        const filtered = friends.filter(
          (f) => !pendingIds.includes(f._id.toString())
        );
        setAvailableFriends(filtered);
      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPending();
  }, [isOpen, circleId, friends]);

  const handleInvite = async (friendId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/circle-requests",
        { circleId, recipientId: friendId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Quitar al invitado de la lista
      setAvailableFriends((prev) => prev.filter((f) => f._id !== friendId));
    } catch (error) {
      console.error("Error enviando invitación:", error);
      alert("No se pudo enviar la invitación");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-semibold mb-4">
          Invitar amigos al círculo
        </h2>

        {loading ? (
          <p className="text-center text-gray-500">Cargando...</p>
        ) : availableFriends.length === 0 ? (
          <p className="text-center text-gray-500">
            No tienes amigos disponibles para invitar o ya tienen invitación
            pendiente.
          </p>
        ) : (
          <ul className="space-y-3 max-h-60 overflow-y-auto">
            {availableFriends.map((friend) => (
              <li
                key={friend._id}
                className="flex items-center justify-between border p-3 rounded-lg"
              >
                {console.log(friend)}
                <div className="flex items-center space-x-3">
                  <img
                    src={
                      friend.profilePicture ||
                      "https://i.ibb.co/4pDNDk1/default-circle.png"
                    }
                    alt="profile"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <span>
                    {friend.firstName} {friend.lastName}
                  </span>
                </div>
                <button
                  onClick={() => handleInvite(friend._id)}
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                >
                  Invitar
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AddFriendModalComp;
