import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import FeedComp from "../components/FeedComp";
import UserLocationComp from "../components/UserLocationComp";
import SocialDashboard from "../components/SocialDashBoardComp";
import { MessageSquare, MapPin, UserCircle2 } from "lucide-react";

const Home = () => {
  const [userLocation, setUserLocation] = useState({
    latitude: null,
    longitude: null,
    city: null,
    error: null,
  });

  const [selectedCircle, setSelectedCircle] = useState(null);
  const [refreshFeed, setRefreshFeed] = useState(false);
  const [activeTab, setActiveTab] = useState("feed");
  const [currentUser, setCurrentUser] = useState(null);

  // Obtener ciudad mediante geolocalización por IP
  useEffect(() => {
    const fetchCity = async () => {
      try {
        const res = await fetch("http://ip-api.com/json/?lang=es");
        const data = await res.json();
        if (data.status === "success") {
          setUserLocation({
            latitude: data.lat,
            longitude: data.lon,
            city: data.city || data.regionName || "Ubicación desconocida",
            error: null,
          });
        } else {
          setUserLocation((prev) => ({
            ...prev,
            city: "Ubicación desconocida",
            error: "No se pudo obtener la ubicación",
          }));
        }
      } catch {
        setUserLocation((prev) => ({
          ...prev,
          city: "Ubicación desconocida",
          error: "Error al obtener ubicación",
        }));
      }
    };
    fetchCity();
  }, []);

  // Fetch current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Error obteniendo usuario");
        const data = await res.json();
        console.log("esto es data dentro del fetch", data);
        setCurrentUser(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCurrentUser();
  }, []);

  const userLocationString = userLocation.city || "Ubicación desconocida";

  // Tabs mobile
  const MobileTabs = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-4">
      <div className="flex">
        <button
          onClick={() => setActiveTab("social")}
          className={`flex-1 flex items-center justify-center gap-2 py-4 px-4 rounded-l-2xl transition-colors ${
            activeTab === "social"
              ? "bg-blue-600 text-white"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <UserCircle2 className="w-4 h-4" />
          <span className="text-sm font-medium">Social</span>
        </button>
        <button
          onClick={() => setActiveTab("feed")}
          className={`flex-1 flex items-center justify-center gap-2 py-4 px-4 rounded-r-2xl transition-colors ${
            activeTab === "feed"
              ? "bg-blue-600 text-white"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span className="text-sm font-medium">Feed</span>
        </button>
        <button
          onClick={() => setActiveTab("map")}
          className={`flex-1 flex items-center justify-center gap-2 py-4 px-4 transition-colors ${
            activeTab === "map"
              ? "bg-blue-600 text-white"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span className="text-sm font-medium">Mapa</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto mb-4">
        <Header currentUser={currentUser} />
      </div>

      {/* Layout MOBILE */}
      <div className="max-w-md mx-auto lg:hidden">
        <MobileTabs />
        {activeTab === "social" && (
          <SocialDashboard
            selectedCircle={selectedCircle}
            setSelectedCircle={setSelectedCircle}
            currentUser={currentUser}
          />
        )}
        {activeTab === "feed" && (
          <div className="space-y-4">
            <FeedComp
              filterCircle={selectedCircle}
              currentUser={currentUser}
              userLocation={userLocation}
            />
          </div>
        )}
        {activeTab === "map" && (
          <UserLocationComp userLocation={userLocationString} />
        )}
      </div>

      {/* Layout DESKTOP */}
      <div className="hidden lg:flex max-w-7xl mx-auto gap-6">
        {/* Sidebar izquierdo */}
        <div className="w-80 flex-shrink-0">
          <SocialDashboard
            selectedCircle={selectedCircle}
            setSelectedCircle={setSelectedCircle}
          />
        </div>

        {/* Contenido principal */}
        <div className="flex-1 space-y-4">
          <FeedComp
            filterCircle={selectedCircle}
            currentUser={currentUser}
            userLocation={userLocation}
          />
        </div>

        {/* Panel derecho */}
        <div className="w-80 flex-shrink-0">
          <UserLocationComp
            onLocationUpdate={({ latitude, longitude, city, error }) =>
              setUserLocation({ latitude, longitude, city, error })
            }
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
