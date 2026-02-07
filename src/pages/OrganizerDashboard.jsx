import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X, LogOut } from "lucide-react";
import OrganizerProfile from "../components/Dashboard/OrganizerProfile";
import ManageHackathons from "../components/Dashboard/ManageHackathons";

const OrganizerDashboard = () => {
  const [activeSection, setActiveSection] = useState("profile");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in as organizer
    const userId = localStorage.getItem("userId");
    const userRole = localStorage.getItem("userRole");
    const userName = localStorage.getItem("userName");

    if (!userId || userRole !== "organizer") {
      navigate("/login-organizer");
      return;
    }

    setUser({
      id: userId,
      name: userName,
      role: userRole
    });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    navigate("/");
  };

  const menuItems = [
    { id: "profile", label: "My Profile", icon: "👤" },
    { id: "manage", label: "Manage Hackathons", icon: "🎯" }
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-gradient-to-b from-amber-500 to-orange-600 text-white transition-all duration-300 shadow-lg`}
      >
        {/* Header */}
        <div className="p-4 flex items-center justify-between">
          <h1 className={`${!sidebarOpen && "hidden"} font-bold text-xl`}>
            HackHunt
          </h1>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 hover:bg-orange-500 rounded-lg transition"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* User Info */}
        <div className="px-4 py-6 border-b border-orange-400">
          <div className={`flex items-center ${!sidebarOpen && "justify-center"}`}>
            <div className="w-10 h-10 bg-orange-300 rounded-full flex items-center justify-center font-bold text-orange-900">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            {sidebarOpen && (
              <div className="ml-3">
                <p className="font-semibold text-sm">{user?.name}</p>
                <p className="text-xs text-orange-100">Organizer</p>
              </div>
            )}
          </div>
        </div>

        {/* Menu Items */}
        <nav className="mt-6 flex flex-col space-y-2 px-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition duration-200 ${
                activeSection === item.id
                  ? "bg-white text-orange-600 font-semibold"
                  : "text-white hover:bg-orange-500"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-4 left-0 right-0 px-2">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition duration-200`}
          >
            <LogOut size={18} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800">
              {menuItems.find((item) => item.id === activeSection)?.label}
            </h2>
            <p className="text-gray-600 mt-1">Welcome back, {user?.name}!</p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            {activeSection === "profile" && <OrganizerProfile user={user} />}
            {activeSection === "manage" && <ManageHackathons user={user} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizerDashboard;
