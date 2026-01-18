import React, { useState, useEffect, useRef } from "react";
import L from "leaflet";
import axios from "axios";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const UserLocationComp = ({ onLocationUpdate }) => {
  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
    error: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const watchIdRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
    }

    mapInstanceRef.current = L.map(mapRef.current, {
      center: [0, 0],
      zoom: 2,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 20,
    }).addTo(mapInstanceRef.current);

    // Forzar la actualización del tamaño del mapa
    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 100);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const updateLocation = (latitude, longitude, error = null) => {
      setLocation({ latitude, longitude, error });
      setIsLoading(false);

      if (mapInstanceRef.current && latitude && longitude) {
        mapInstanceRef.current.setView([latitude, longitude], 15);

        if (!markerRef.current) {
          markerRef.current = L.marker([latitude, longitude], {
            title: "Tu ubicación",
          }).addTo(mapInstanceRef.current);
        } else {
          markerRef.current.setLatLng([latitude, longitude]);
        }

        mapInstanceRef.current.invalidateSize();
      }

      if (onLocationUpdate) {
        onLocationUpdate({ latitude, longitude, error });
      }
    };

    // Intentar geolocalización del navegador
    if (navigator.geolocation) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          updateLocation(latitude, longitude);
        },
        (err) => {
          // Si falla, intentar con la API de ipapi
          axios
            .get("https://ipapi.co/json/")
            .then((response) => {
              const { latitude, longitude, error: apiError } = response.data;
              if (latitude && longitude) {
                updateLocation(latitude, longitude);
              } else {
                updateLocation(null, null, apiError || "No se pudo obtener la ubicación desde la IP");
              }
            })
            .catch(() => {
              updateLocation(null, null, "No se pudo obtener la ubicación desde la IP");
            });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      // Si no hay geolocalización, usar ipapi
      axios
        .get("https://ipapi.co/json/")
        .then((response) => {
          const { latitude, longitude, error: apiError } = response.data;
          if (latitude && longitude) {
            updateLocation(latitude, longitude);
          } else {
            updateLocation(null, null, apiError || "No se pudo obtener la ubicación desde la IP");
          }
        })
        .catch(() => {
          updateLocation(null, null, "No se pudo obtener la ubicación desde la IP");
        });
    }

    return () => {
      if (navigator.geolocation && watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [onLocationUpdate]);

  return (
    <div className="p-4">
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Tu Ubicación en Tiempo Real
        </h2>
        {isLoading && (
          <p className="text-gray-500">Cargando mapa y ubicación...</p>
        )}
        {location.error && (
          <p className="text-red-600">{location.error}</p>
        )}
        <div
          ref={mapRef}
          className="w-full h-96 rounded-lg overflow-hidden shadow-inner"
          style={{ minHeight: "384px" }}
        ></div>
        {location.latitude && location.longitude && (
          <p className="text-sm text-gray-700 mt-2">
            Latitud: {location.latitude.toFixed(6)}°, Longitud:{" "}
            {location.longitude.toFixed(6)}°
          </p>
        )}
      </div>
    </div>
  );
};

export default UserLocationComp;