import React, { useState, useEffect, useRef } from "react";
import {
  Clock,
  MapPin,
  Users,
  User,
  Info,
  AlertCircle,
  LogOut,
  Settings,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import RequestModalUserComp from "./RequestModalUserComp";
import EditProfileModalComp from "./EditProfileModalComp";

const API_BASE_FRIENDS = "http://localhost:5000/api/friend-requests";
const API_BASE_CIRCLES = "http://localhost:5000/api/circle-requests";

const Header = ({ onProvideRefresh }) => {
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  );
  const [location, setLocation] = useState("Obteniendo ubicación...");
  const [isNotificationsActive, setIsNotificationsActive] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const [pendingFriendRequests, setPendingFriendRequests] = useState(0);
  const [pendingCircleRequests, setPendingCircleRequests] = useState(0);

  const [friendBadge, setFriendBadge] = useState(0);
  const [circleBadge, setCircleBadge] = useState(0);

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [currentUser, setCurrentUser] = useState(null); // ahora lo manejamos aquí
  const [showCircleModal, setShowCircleModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);

  const userMenuRef = useRef(null);
  const navigate = useNavigate();

  // --- Funciones para solicitudes ---
  const fetchFriendRequestsCount = async () => {
    const token = localStorage.getItem("token");
    if (!token || !isAuthenticated) return 0;
    try {
      const res = await fetch(`${API_BASE_FRIENDS}/received`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const count = data.filter((r) => r.status === "pending" || !r.status)
        .length;
      setPendingFriendRequests(count);
      setFriendBadge(count);
      return count;
    } catch {
      setPendingFriendRequests(0);
      return 0;
    }
  };

  const fetchCircleRequestsCount = async () => {
    const token = localStorage.getItem("token");
    if (!token || !isAuthenticated) return 0;
    try {
      const res = await fetch(`${API_BASE_CIRCLES}/mine`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const count = data.filter((r) => r.status === "pending" || !r.status)
        .length;
      setPendingCircleRequests(count);
      setCircleBadge(count);
      return count;
    } catch {
      setPendingCircleRequests(0);
      return 0;
    }
  };

  const refreshRequests = () => {
    fetchFriendRequestsCount();
    fetchCircleRequestsCount();
  };

  // --- Funciones para usuario ---
  const fetchCurrentUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch("http://localhost:5000/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error al obtener datos del usuario");
      const data = await res.json();
      setCurrentUser(data);
    } catch (err) {
      console.error(err);
    }
  };

  const checkAuthentication = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsAuthenticated(false);
      return false;
    }
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const expired = payload.exp && payload.exp * 1000 < Date.now();
      if (expired) {
        localStorage.removeItem("token");
        setIsAuthenticated(false);
        return false;
      }
      setIsAuthenticated(true);
      return true;
    } catch {
      localStorage.removeItem("token");
      setIsAuthenticated(false);
      return false;
    }
  };

  // --- Efectos ---
  useEffect(() => {
    const auth = checkAuthentication();

    const timer = setInterval(() => {
      setCurrentTime(
        new Date().toLocaleTimeString("es-ES", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    }, 1000);

    const getLocationByIP = async () => {
      try {
        const res = await fetch("http://ip-api.com/json/?lang=es");
        const data = await res.json();
        if (data.status === "success") {
          const userLocation =
            data.city || data.regionName || "Ubicación desconocida";
          setLocation(userLocation);
        } else {
          setLocation("Ubicación desconocida");
        }
      } catch {
        setLocation("Ubicación desconocida");
      }
    };
    getLocationByIP();

    if (auth) {
      fetchCurrentUser(); // traemos info de usuario al iniciar
      refreshRequests();
      const requestsInterval = setInterval(refreshRequests, 30000);
      return () => {
        clearInterval(timer);
        clearInterval(requestsInterval);
      };
    }
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isAuthenticated) refreshRequests();
  }, [isAuthenticated]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const totalPendingRequests = pendingFriendRequests + pendingCircleRequests;

  const toggleNotifications = () =>
    setIsNotificationsActive(!isNotificationsActive);
  const toggleUserMenu = () => setShowUserMenu(!showUserMenu);

  const handleMenuClick = (action) => {
    setShowUserMenu(false);
    if (action === "logout") {
      localStorage.removeItem("token");
      setIsAuthenticated(false);
      navigate("/");
    }
  };

  const handleFriendRequests = () => setShowCircleModal(true);

  const handleCloseEditProfile = () => {
    setShowEditProfileModal(false);
    fetchCurrentUser(); // refresca la info del usuario incluyendo la foto
  };

  return (
    <header className="bg-white border-b border-gray-200 py-3 px-4">
      <div className="max-w-lg mx-auto flex items-center justify-center gap-4">
        <div className="flex items-center justify-center space-x-3">
          <div className="flex items-center bg-gray-50 rounded-lg px-3 py-1.5">
            <Clock className="w-4 h-4 text-gray-600 mr-2" />
            <span className="text-sm text-gray-700 font-medium">
              {currentTime}
            </span>
          </div>
          <div className="flex items-center bg-blue-50 rounded-lg px-3 py-1.5">
            <MapPin className="w-4 h-4 text-blue-600 mr-2" />
            <span className="text-sm text-blue-700 font-medium">{location}</span>
          </div>

          {isAuthenticated && currentUser && (
            <>
              {/* Botón solicitudes */}
              <button
                onClick={handleFriendRequests}
                className="relative p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <Users className="w-5 h-5" />
                {totalPendingRequests > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                    {totalPendingRequests > 9 ? "9+" : totalPendingRequests}
                  </span>
                )}
              </button>

              {/* Botón notificaciones */}
              <button
                onClick={toggleNotifications}
                className={`relative p-2 rounded-full transition-colors ${
                  isNotificationsActive
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill={isNotificationsActive ? "currentColor" : "none"}
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
                  />
                </svg>
              </button>

              {/* Menú usuario */}
              <div className="relative" ref={userMenuRef}>
                <img
                  src={
                    currentUser?.profilePicture ||
                    "https://i.ibb.co/4pDNDk1/default-circle.png"
                  }
                  alt="user"
                  className="w-10 h-10 rounded-full object-cover cursor-pointer"
                  onClick={toggleUserMenu}
                />
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="font-semibold text-gray-900 text-sm">
                        {currentUser.firstName + " " + currentUser.lastName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {currentUser.email}
                      </p>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          setShowEditProfileModal(true);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-3"
                      >
                        <User className="w-4 h-4 text-gray-500" />
                        <span>Ver perfil</span>
                      </button>
                      <button
                        onClick={() => handleMenuClick("settings")}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-3"
                      >
                        <Settings className="w-4 h-4 text-gray-500" />
                        <span>Configuración</span>
                      </button>
                      <button
                        onClick={() => handleMenuClick("info")}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-3"
                      >
                        <Info className="w-4 h-4 text-gray-500" />
                        <span>Información</span>
                      </button>
                      <button
                        onClick={() => handleMenuClick("report")}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-3"
                      >
                        <AlertCircle className="w-4 h-4 text-gray-500" />
                        <span>Reportar errores</span>
                      </button>
                      <hr className="my-1 border-gray-100" />
                      <button
                        onClick={() => handleMenuClick("logout")}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-3"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Cerrar sesión</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal solicitudes */}
      {isAuthenticated && showCircleModal && (
        <RequestModalUserComp
          onClose={() => setShowCircleModal(false)}
          onUpdateRequests={refreshRequests}
          friendBadge={friendBadge}
          setFriendBadge={setFriendBadge}
          circleBadge={circleBadge}
          setCircleBadge={setCircleBadge}
        />
      )}

      {/* Modal editar perfil */}
      {showEditProfileModal && currentUser && (
        <EditProfileModalComp
          isOpen={showEditProfileModal}
          onClose={handleCloseEditProfile}
          currentUser={currentUser}
        />
      )}
    </header>
  );
};

export default Header;
