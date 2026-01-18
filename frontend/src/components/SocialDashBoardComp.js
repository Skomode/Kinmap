import React, { useState } from "react";
import CirclesDashboardComp from "./CirclesDashBoardComp";
import PeopleDashboardComp from "./PeopleDashBoardComp";

const SocialDashboard = ({ selectedCircle, setSelectedCircle, currentUser }) => {
  const [activeTab, setActiveTab] = useState("circles");

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="mb-4 flex justify-center gap-4">
        <button
          onClick={() => setActiveTab("circles")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === "circles"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Mis Círculos
        </button>
        <button
          onClick={() => setActiveTab("people")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === "people"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Mis Contactos
        </button>
      </div>

      {activeTab === "circles" ? (
        <CirclesDashboardComp
          selectedCircle={selectedCircle}
          setSelectedCircle={setSelectedCircle}
        />
      ) : (
        <PeopleDashboardComp/>
      )}
    </div>
  );
};

export default SocialDashboard;
