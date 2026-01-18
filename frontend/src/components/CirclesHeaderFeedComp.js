import React, { useState, useEffect } from "react";
import { Users, Tag, UserPlus, Trash2 } from "lucide-react";
import AddFriendModalComp from "./AddFriendModalComp";
import EditCircleModalComp from "./EditCircleModalComp";
import axios from "axios";

const CirclesHeaderFeedComp = ({ circle, currentUser, onCircleDeleted }) => {
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [showEditCircleModal, setShowEditCircleModal] = useState(false);
  const [circleData, setCircleData] = useState(circle);
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/friends", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFriends(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error(err);
        setFriends([]);
      }
    };
    fetchFriends();
  }, []);

  if (!circleData) return null;

  const memberCount = circleData.members?.length || 0;

  const isOwner =
    currentUser &&
    circleData.ownerId &&
    (typeof circleData.ownerId === "string"
      ? circleData.ownerId === String(currentUser._id)
      : String(circleData.ownerId._id) === String(currentUser._id));

  const handleDeleteCircle = async () => {
    if (!isOwner) {
      alert("Solo el creador del círculo puede eliminarlo");
      return;
    }

    if (!window.confirm("¿Seguro que deseas eliminar este círculo?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/circles/${circleData._id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Error al eliminar el círculo");

      alert("Círculo eliminado correctamente");

      // 🔄 Recargamos la página para reflejar los cambios
      window.location.reload();

      // Opcional: avisamos al padre (si quieres usarlo para algo)
      if (onCircleDeleted) onCircleDeleted(circleData._id);
    } catch (err) {
      console.error(err);
      alert("No se pudo eliminar el círculo");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow p-6 mb-4 flex justify-between items-start relative">
      <div className="flex items-center gap-4">
        <img
          src={
            circleData.image || "https://i.ibb.co/4pDNDk1/default-circle.png"
          }
          alt={circleData.name}
          onError={(e) =>
            (e.currentTarget.src =
              "https://i.ibb.co/4pDNDk1/default-circle.png")
          }
          className="w-12 h-12 rounded-full object-cover"
        />
        <div>
          <h2 className="font-semibold text-gray-800 text-lg">
            {circleData.name}
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            {circleData.description || "Sin descripción"}
          </p>
          <div className="flex flex-col gap-1 mt-2 text-gray-500 text-sm">
            {circleData.category && (
              <div className="flex items-center gap-1">
                <Tag className="w-4 h-4" /> {circleData.category}
              </div>
            )}
            <div
              className="flex items-center gap-1 cursor-pointer relative"
              onMouseEnter={() => setShowMembers(true)}
              onMouseLeave={() => setShowMembers(false)}
              onClick={() => setShowMembers(!showMembers)}
            >
              <Users className="w-4 h-4" /> {memberCount} miembros
              {showMembers && (
                <div className="absolute top-full left-0 mt-1 bg-white border rounded shadow p-2 flex flex-col z-50 max-w-xs">
                  {circleData.members.map((member) => (
                    <div
                      key={member._id}
                      className="flex items-center gap-2 p-1 hover:bg-gray-100 rounded"
                    >
                      <img
                        src={
                          member.profilePicture ||
                          "https://i.ibb.co/4pDNDk1/default-circle.png"
                        }
                        alt={member.firstName}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <span className="text-sm truncate max-w-[150px]">
                        {member.firstName} {member.lastName}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-end gap-2 ml-auto">
        {isOwner && (
          <>
            <button
              onClick={() => setShowAddFriendModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 text-sm"
            >
              <UserPlus className="w-4 h-4" /> Añadir amigos
            </button>
            <button
              onClick={() => setShowEditCircleModal(true)}
              className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg flex items-center gap-2 text-sm"
            >
              Editar círculo
            </button>

            <button
              onClick={handleDeleteCircle}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2 text-sm"
            >
              <Trash2 className="w-4 h-4" /> Eliminar círculo
            </button>
          </>
        )}
      </div>
      <AddFriendModalComp
        isOpen={showAddFriendModal}
        onClose={() => setShowAddFriendModal(false)}
        circleId={circleData._id}
        friends={friends}
        onFriendAdded={() => setShowAddFriendModal(false)}
      />

      <EditCircleModalComp
        isOpen={showEditCircleModal}
        onClose={() => setShowEditCircleModal(false)}
        circle={circleData}
        onUpdated={(updated) => setCircleData(updated)}
      />
    </div>
  );
};

export default CirclesHeaderFeedComp;
