import React, { useState, useEffect } from "react";
import { Users, Plus, Clock, Tag, Shield } from "lucide-react";
import axios from "axios";
import CreateCircleModalComp from "./CreateCircleModalComp";
import AddFriendModalComp from "./AddFriendModalComp";

const CirclesDashboardComp = ({ selectedCircle, setSelectedCircle }) => {
  const [circles, setCircles] = useState([]);
  const [friends, setFriends] = useState([]);
  const [activeCircle, setActiveCircle] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);

  // 🔹 Traer círculos
  useEffect(() => {
    const fetchCircles = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/circles/mine", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // 🔹 Convertimos la ruta de cada imagen a URL completa
        const circlesWithFullImage = res.data.map((circle) => ({
          ...circle,
          image: circle.image
            ? `http://localhost:5000${circle.image}`
            : "https://i.ibb.co/4pDNDk1/default-circle.png",
        }));

        setCircles(circlesWithFullImage);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCircles();
  }, []);

  // 🔹 Traer amigos
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

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-400";
      case "idle":
        return "bg-yellow-400";
      case "inactive":
        return "bg-gray-400";
      default:
        return "bg-gray-400";
    }
  };

  const handleCircleClick = (circle) => {
    // Toggle: si ya está seleccionado, deselecciona
    if (selectedCircle?._id === circle._id) {
      setActiveCircle(null);
      setSelectedCircle(null);
    } else {
      setActiveCircle(circle._id);
      setSelectedCircle(circle);
    }
  };

const handleCircleUpdated = (updatedCircle) => {
  setCircles((prevCircles) =>
    prevCircles.map((circle) =>
      circle._id === updatedCircle._id ? updatedCircle : circle
    )
  );

  if (selectedCircle?._id === updatedCircle._id) {
    setSelectedCircle(updatedCircle);
  }
};

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 h-fit sticky top-4">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Mis Círculos
          </h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto p-4 space-y-3">
          {circles.length === 0 && (
            <p className="text-sm text-gray-500 text-center">
              No tienes círculos creados. ¡Crea tu primer círculo!
            </p>
          )}

          {circles.map((circle) => (
            <div
              key={circle._id || circle.id}
              className={`relative group cursor-pointer transition-all duration-200 ${
                selectedCircle?._id === circle._id
                  ? "bg-blue-50 border-blue-200"
                  : "bg-gray-50 hover:bg-gray-100 border-gray-200"
              } border rounded-xl p-4`}
              onClick={() => handleCircleClick(circle)}
            >
              <div
                className={`absolute top-3 right-3 w-2 h-2 rounded-full ${getStatusColor(
                  circle.status
                )}`}
              ></div>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <img
                    src={
                      circle.image ||
                      "https://i.ibb.co/4pDNDk1/default-circle.png"
                    }
                    alt={circle.name}
                    onError={(e) =>
                      (e.currentTarget.src =
                        "https://i.ibb.co/4pDNDk1/default-circle.png")
                    }
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {circle.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Users className="w-3 h-3" />
                      {circle.members?.length || circle.members || 0}
                      <Clock className="w-3 h-3 ml-2" />
                      {circle.lastUpdate || "Ahora"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modales */}
      <CreateCircleModalComp
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        setCircles={setCircles}
        friends={friends}
      />

      <AddFriendModalComp
        isOpen={showAddFriendModal}
        onClose={() => setShowAddFriendModal(false)}
        circle={selectedCircle}
        friends={friends}
        onFriendAdded={() => setShowAddFriendModal(false)}
      />
    </>
  );
};

export default CirclesDashboardComp;
