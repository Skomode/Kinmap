import React, { useState, useEffect } from "react";
import { Plus, Users } from "lucide-react";
import SendFriendRequestModal from "./SendFriendRequestModal";
import { sendFriendRequest as apiSendFriendRequest } from "../utils/api";

const PeopleDashboardComp = () => {
  const [friends, setFriends] = useState([]);
  const [showFriendRequestModal, setShowFriendRequestModal] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/friends", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setFriends(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setFriends([]);
      }
    };
    fetchFriends();
  }, [token]);

  const handleSendFriendRequest = async ({ email, message }) => {
    try {
      await apiSendFriendRequest(email, message, token);
    } catch (err) {
      throw err;
    }
  };

  const avatarColors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-yellow-500",
    "bg-red-500",
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 h-fit p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          Amigos
        </h2>
        <button
          onClick={() => setShowFriendRequestModal(true)}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {friends.length > 0 ? (
          friends.map((friend, index) => {
            const color = avatarColors[index % avatarColors.length];
            return (
              <div
                key={friend._id}
                className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center gap-4"
              >
                <img
                  src={
                    friend.profilePicture ||
                    "https://i.ibb.co/4pDNDk1/default-circle.png"
                  }
                  alt={friend.firstName}
                  onError={(e) =>
                    (e.currentTarget.src =
                      "https://i.ibb.co/4pDNDk1/default-circle.png")
                  }
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-800">
                    {friend.firstName} {friend.lastName}
                  </span>
                  <span
                    className={`text-sm ${
                      friend.isActive ? "text-green-600" : "text-gray-500"
                    }`}
                  >
                    {friend.status}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-sm text-gray-500 text-center py-4">
            No tienes amigos agregados
          </p>
        )}
      </div>

      <SendFriendRequestModal
        isOpen={showFriendRequestModal}
        onClose={() => setShowFriendRequestModal(false)}
        onSendRequest={handleSendFriendRequest}
      />
    </div>
  );
};

export default PeopleDashboardComp;
