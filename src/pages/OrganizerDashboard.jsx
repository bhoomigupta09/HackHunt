import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X, LogOut } from "lucide-react";
import OrganizerProfile from "../components/Dashboard/OrganizerProfile";
import ManageHackathons from "../components/Dashboard/ManageHackathons";
import LogoutConfirmModal from "../components/Dashboard/LogoutConfirmModal";

const OrganizerDashboard = () => {
  const [activeSection, setActiveSection] = useState("profile");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
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

  const confirmLogout = () => {
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
    <div className="flex h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.16),transparent_24%),linear-gradient(180deg,#fff7ed,#fffbeb_48%,#f8fafc)]">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } relative flex flex-col overflow-y-auto border-r border-white/20 bg-gradient-to-b from-amber-500 via-orange-500 to-rose-500 text-white transition-all duration-300 shadow-2xl`}
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
        <nav className="mt-6 flex flex-1 flex-col space-y-2 px-2">
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
        <div className="mt-auto px-2 pb-4 pt-6">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className={`w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition duration-200`}
          >
            <LogOut size={18} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl p-6 md:p-8">
          {/* Header */}
          <div className="mb-8 rounded-[30px] border border-white/70 bg-white/80 px-6 py-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              {menuItems.find((item) => item.id === activeSection)?.label}
            </h2>
            <p className="mt-2 text-slate-600">Welcome back, {user?.name}! Organizer updates go live across the platform.</p>
          </div>

          {/* Content */}
          <div className="rounded-[32px] border border-white/70 bg-white/85 p-6 shadow-[0_24px_90px_rgba(15,23,42,0.08)] backdrop-blur md:p-8">
            {activeSection === "profile" && <OrganizerProfile user={user} />}
            {activeSection === "manage" && <ManageHackathons user={user} />}
          </div>
        </div>
      </div>

      <LogoutConfirmModal
        open={showLogoutConfirm}
        onCancel={() => setShowLogoutConfirm(false)}
        onConfirm={confirmLogout}
      />
    </div>
  );
};

export default OrganizerDashboard;
