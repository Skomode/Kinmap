// --- RequestModalUserComp.jsx ---
import React, { useState, useEffect } from "react";
import { X, Check, XCircle, AlertCircle, Users, Shield } from "lucide-react";

const API_BASE_FRIENDS = "http://localhost:5000/api/friend-requests";
const API_BASE_CIRCLES = "http://localhost:5000/api/circle-requests";

const RequestModalUserComp = ({
  onClose,
  onUpdateRequests,
  friendBadge,
  setFriendBadge,
  circleBadge,
  setCircleBadge,
}) => {
  const [activeTab, setActiveTab] = useState("friends");
  const [peopleRequests, setPeopleRequests] = useState([]);
  const [circleRequests, setCircleRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");

  // Cargar solicitudes de amistad
  const fetchPeopleRequests = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_FRIENDS}/received`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error cargando solicitudes de amistad");
      const data = await res.json();
      setPeopleRequests(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar invitaciones de círculos
  const fetchCircleRequests = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_CIRCLES}/mine`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error cargando invitaciones de círculos");
      const data = await res.json();
      setCircleRequests(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "friends") {
      fetchPeopleRequests();
      setFriendBadge(0);
    } else {
      fetchCircleRequests();
      setCircleBadge(0);
    }
  }, [activeTab]);

  const handleFriendRespond = async (requestId, action) => {
    try {
      const res = await fetch(`${API_BASE_FRIENDS}/${requestId}/respond`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al responder");

      setPeopleRequests((prev) => prev.filter((r) => r._id !== requestId));
      if (onUpdateRequests) onUpdateRequests();
    } catch (err) {
      console.error(err);
      alert(err.message || "Error al procesar la solicitud");
    }
  };

  const handleCircleRespond = async (requestId, status) => {
    try {
      const res = await fetch(`${API_BASE_CIRCLES}/${requestId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al responder");

      setCircleRequests((prev) => prev.filter((r) => r._id !== requestId));
      if (onUpdateRequests) onUpdateRequests();
    } catch (err) {
      console.error(err);
      alert(err.message || "Error al procesar la invitación");
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
      style={{ zIndex: 99999 }}
    >
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-auto shadow-2xl">
        <div className="border-b">
          <div className="flex items-center justify-between p-4">
            <h2 className="text-lg font-semibold">Solicitudes</h2>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex">
            <button
              onClick={() => setActiveTab("friends")}
              className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${
                activeTab === "friends"
                  ? "border-blue-600 text-blue-600 bg-blue-50"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Users className="w-4 h-4" />
              Amistad
              {friendBadge > 0 && (
                <span className="ml-1 inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium text-white bg-red-500 rounded-full">
                  {friendBadge}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("circles")}
              className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${
                activeTab === "circles"
                  ? "border-blue-600 text-blue-600 bg-blue-50"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Shield className="w-4 h-4" />
              Círculos
              {circleBadge > 0 && (
                <span className="ml-1 inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium text-white bg-red-500 rounded-full">
                  {circleBadge}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {isLoading && <p>Cargando...</p>}
          {error && (
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" /> {error}
            </div>
          )}

          {activeTab === "friends" &&
            (peopleRequests.length === 0 ? (
              <p className="text-gray-500 text-center">
                No tienes solicitudes de amistad pendientes
              </p>
            ) : (
              peopleRequests.map((req) => (
                <div
                  key={req._id}
                  className="border border-gray-200 rounded-lg p-4 flex items-start space-x-3"
                >
                  {console.log(
                    `http://localhost:5000/uploads/peoplePic/${req.sender.profilePicture}`
                  )}
                  <img
                    src={
                      req.sender?.profilePicture
                        ? `http://localhost:5000/uploads/peoplePic/${req.sender.profilePicture}`
                        : "https://i.ibb.co/4pDNDk1/default-profile.png"
                    }
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://i.ibb.co/4pDNDk1/default-profile.png";
                    }}
                    className="w-10 h-10 rounded-full object-cover border"
                  />

                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm">
                      {req.sender?.name || "Usuario desconocido"}
                    </h3>
                    {req.sender?.email && (
                      <p className="text-xs text-gray-500">
                        {req.sender.email}
                      </p>
                    )}
                    {req.message && (
                      <p className="text-xs text-gray-600 mt-1">
                        {req.message}
                      </p>
                    )}
                    <div className="flex space-x-2 mt-3">
                      <button
                        onClick={() => handleFriendRespond(req._id, "accept")}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-sm flex items-center justify-center gap-1"
                      >
                        <Check className="w-4 h-4" /> Aceptar
                      </button>
                      <button
                        onClick={() => handleFriendRespond(req._id, "reject")}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-3 rounded-lg text-sm flex items-center justify-center gap-1"
                      >
                        <XCircle className="w-4 h-4" /> Rechazar
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ))}

          {activeTab === "circles" &&
            (circleRequests.length === 0 ? (
              <p className="text-gray-500 text-center">
                No tienes invitaciones de círculos pendientes
              </p>
            ) : (
              circleRequests.map((req) => (
                <div
                  key={req._id}
                  className="border border-gray-200 rounded-lg p-4 flex items-start space-x-3"
                >
                  {console.log("mira esto ", req.circleId)}
                  <img
                    src={
                      req.circleId?.image
                        ? `http://localhost:5000${req.circleId.image}`
                        : "https://i.ibb.co/4pDNDk1/default-circle.png"
                    }
                    onError={(e) =>
                      (e.currentTarget.src =
                        "https://i.ibb.co/4pDNDk1/default-circle.png")
                    }
                    className="w-12 h-12 rounded-full object-cover"
                  />

                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm">
                      {req.circleId?.name || "Círculo"}
                    </h3>
                    <p className="text-xs text-gray-500">
                      Invitado por: {req.inviterId?.firstName}{" "}
                      {req.inviterId?.lastName}
                    </p>
                    {req.circleId?.description && (
                      <p className="text-xs text-gray-600 mt-1">
                        {req.circleId.description}
                      </p>
                    )}
                    <div className="flex space-x-2 mt-3">
                      <button
                        onClick={() => handleCircleRespond(req._id, "accepted")}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg text-sm flex items-center justify-center gap-1"
                      >
                        <Check className="w-4 h-4" /> Unirme
                      </button>
                      <button
                        onClick={() => handleCircleRespond(req._id, "rejected")}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-3 rounded-lg text-sm flex items-center justify-center gap-1"
                      >
                        <XCircle className="w-4 h-4" /> Rechazar
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ))}
        </div>
      </div>
    </div>
  );
};

export default RequestModalUserComp;
