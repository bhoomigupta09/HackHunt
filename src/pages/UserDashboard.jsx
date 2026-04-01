// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { Menu, X, LogOut } from "lucide-react";
// import MyProfile from "../components/Dashboard/MyProfile";
// import BrowseHackathons from "../components/Dashboard/BrowseHackathons";
// import RegisteredHackathons from "../components/Dashboard/RegisteredHackathons";

// const UserDashboard = () => {
//   const [activeSection, setActiveSection] = useState("profile");
//   const [sidebarOpen, setSidebarOpen] = useState(true);
//   const [user, setUser] = useState(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     // Check if user is logged in
//     const userId = localStorage.getItem("userId");
//     const userRole = localStorage.getItem("userRole");
//     const userName = localStorage.getItem("userName");

//     if (!userId || userRole !== "user") {
//       navigate("/login?role=user");
//       return;
//     }

//     setUser({
//       id: userId,
//       name: userName,
//       role: userRole
//     });
//   }, [navigate]);

//   const handleLogout = () => {
//     localStorage.removeItem("isLoggedIn");
//     localStorage.removeItem("userId");
//     localStorage.removeItem("userRole");
//     localStorage.removeItem("userName");
//     navigate("/");
//   };

//   const menuItems = [
//     { id: "profile", label: "My Profile", icon: "ðŸ‘¤" },
//     { id: "browse", label: "Browse Hackathons", icon: "ðŸ”" },
//     { id: "registered", label: "My Registrations", icon: "âœ…" }
//   ];

//   return (
//     <div className="flex h-screen bg-gray-100">
//       {/* Sidebar */}
//       <div
//         className={`${
//           sidebarOpen ? "w-64" : "w-20"
//         } bg-gradient-to-b from-purple-600 to-purple-800 text-white transition-all duration-300 shadow-lg`}
//       >
//         {/* Header */}
//         <div className="p-4 flex items-center justify-between">
//           <h1 className={`${!sidebarOpen && "hidden"} font-bold text-xl`}>
//             HackHunt
//           </h1>
//           <button
//             onClick={() => setSidebarOpen(!sidebarOpen)}
//             className="p-1 hover:bg-purple-500 rounded-lg transition"
//           >
//             {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
//           </button>
//         </div>

//         {/* User Info */}
//         <div className="px-4 py-6 border-b border-purple-500">
//           <div className={`flex items-center ${!sidebarOpen && "justify-center"}`}>
//             <div className="w-10 h-10 bg-purple-300 rounded-full flex items-center justify-center font-bold text-purple-900">
//               {user?.name?.charAt(0)?.toUpperCase()}
//             </div>
//             {sidebarOpen && (
//               <div className="ml-3">
//                 <p className="font-semibold text-sm">{user?.name}</p>
//                 <p className="text-xs text-purple-200">User</p>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Menu Items */}
//         <nav className="mt-6 flex flex-col space-y-2 px-2">
//           {menuItems.map((item) => (
//             <button
//               key={item.id}
//               onClick={() => setActiveSection(item.id)}
//               className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition duration-200 ${
//                 activeSection === item.id
//                   ? "bg-white text-purple-600 font-semibold"
//                   : "text-white hover:bg-purple-500"
//               }`}
//             >
//               <span className="text-xl">{item.icon}</span>
//               {sidebarOpen && <span>{item.label}</span>}
//             </button>
//           ))}
//         </nav>

//         {/* Logout Button */}
//         <div className="absolute bottom-4 left-0 right-0 px-2">
//           <button
//             onClick={handleLogout}
//             className={`w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition duration-200`}
//           >
//             <LogOut size={18} />
//             {sidebarOpen && <span>Logout</span>}
//           </button>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="flex-1 overflow-auto">
//         <div className="p-8">
//           {/* Header */}
//           <div className="mb-8">
//             <h2 className="text-3xl font-bold text-gray-800">
//               {menuItems.find((item) => item.id === activeSection)?.label}
//             </h2>
//             <p className="text-gray-600 mt-1">Welcome back, {user?.name}!</p>
//           </div>

//           {/* Content */}
//           <div className="bg-white rounded-xl shadow-lg p-8">
//             {activeSection === "profile" && <MyProfile user={user} />}
//             {activeSection === "browse" && <BrowseHackathons user={user} />}
//             {activeSection === "registered" && <RegisteredHackathons user={user} />}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default UserDashboard;


import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Menu, X, LogOut } from "lucide-react";
import MyProfile from "../components/Dashboard/MyProfile";
import BrowseHackathons from "../components/Dashboard/BrowseHackathons";
import RegisteredHackathons from "../components/Dashboard/RegisteredHackathons";
import HackathonTrackingMap from "../components/HackathonTrackingMap";
import LogoutConfirmModal from "../components/Dashboard/LogoutConfirmModal";

const UserDashboard = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const sectionFromQuery = params.get("section");
  const locationFromQuery = params.get("location") || "";
  const defaultSection =
    sectionFromQuery && ["profile", "browse", "registered", "track"].includes(sectionFromQuery)
      ? sectionFromQuery
      : "browse";

  const [activeSection, setActiveSection] = useState(defaultSection);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState({ name: "User", role: "user", id: "" }); // Default values set kar di
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const userId = localStorage.getItem("userId");
    const userRole = localStorage.getItem("userRole");
    const userName = localStorage.getItem("userName");

    if (!userId || userRole !== "user") {
      navigate("/login?role=user");
      return;
    }

    // "undefined" string check aur fallback
    setUser({
      id: userId,
      name: (userName && userName !== "undefined") ? userName : "User",
      role: userRole
    });
  }, [navigate]);

  useEffect(() => {
    if (sectionFromQuery && ["profile", "browse", "registered", "track"].includes(sectionFromQuery)) {
      setActiveSection(sectionFromQuery);
    }
  }, [sectionFromQuery]);

  const switchSection = (sectionId) => {
    setActiveSection(sectionId);
    if (sectionId === "browse" && locationFromQuery) {
      navigate(`/dashboard/user?section=${sectionId}&location=${encodeURIComponent(locationFromQuery)}`);
      return;
    }
    navigate(`/dashboard/user?section=${sectionId}`);
  };

  const confirmLogout = () => {
    localStorage.clear(); // Saara kachra ek saath saaf
    navigate("/");
  };

  const menuItems = [
    { id: "profile", label: "My Profile", icon: "" },
    { id: "browse", label: "Browse Hackathons", icon: "" },
    { id: "registered", label: "My Registrations", icon: "" },
    { id: "track", label: "Track Hackathons", icon: "" }
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.16),transparent_24%),linear-gradient(180deg,#f8fafc,#eef2ff_48%,#f8fafc)]">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } relative flex flex-col overflow-y-auto border-r border-white/20 bg-gradient-to-b from-violet-700 via-purple-600 to-indigo-700 text-white transition-all duration-300 shadow-2xl`}
      >
        {/* Header */}
        <div className="p-4 flex items-center justify-between">
          <h1 className={`${!sidebarOpen && "hidden"} font-bold text-xl`}>
            HackHunt
          </h1>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 hover:bg-purple-500 rounded-lg transition"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* User Info - Handled undefined with Optional Chaining (?.) */}
        <div className="px-4 py-6 border-b border-purple-500">
          <div className={`flex items-center ${!sidebarOpen && "justify-center"}`}>
            <div className="w-10 h-10 bg-purple-300 rounded-full flex items-center justify-center font-bold text-purple-900">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            {sidebarOpen && (
              <div className="ml-3">
                <p className="font-semibold text-sm">{user?.name || "User"}</p>
                <p className="text-xs text-purple-200">User Account</p>
              </div>
            )}
          </div>
        </div>

        {/* Menu Items */}
        <nav className="mt-6 flex flex-1 flex-col space-y-2 px-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => switchSection(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition duration-200 ${
                activeSection === item.id
                  ? "bg-white text-purple-600 font-semibold"
                  : "text-white hover:bg-purple-500"
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
            className={`w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-red-500 via-rose-500 to-fuchsia-600 hover:from-red-600 hover:to-fuchsia-700 text-white rounded-2xl shadow-lg shadow-red-500/30 transition duration-200`}
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
            <p className="mt-2 text-slate-600">Welcome back, {user?.name || "User"}! Explore approved hackathons and manage your profile here.</p>
          </div>

          {/* Content */}
          <div className="rounded-[32px] border border-white/70 bg-white/85 p-6 shadow-[0_24px_90px_rgba(15,23,42,0.08)] backdrop-blur md:p-8">
            {activeSection === "profile" && <MyProfile user={user} />}
            {activeSection === "browse" && <BrowseHackathons user={user} initialSearchTerm={locationFromQuery} />}
            {activeSection === "registered" && <RegisteredHackathons user={user} />}
            {activeSection === "track" && <HackathonTrackingMap />}
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

export default UserDashboard;
