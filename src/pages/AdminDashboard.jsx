import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  Users,
  X
} from "lucide-react";
import AdminProfile from "../components/Dashboard/AdminProfile";
import ManageUsers from "../components/Dashboard/ManageUsers";
import HackathonApprovals from "../components/Dashboard/HackathonApprovals";
import LogoutConfirmModal from "../components/Dashboard/LogoutConfirmModal";
import AdminOverview from "../components/Dashboard/AdminOverview";
import AdminActivityLog from "../components/Dashboard/AdminActivityLog";
import AdminSectionErrorBoundary from "../components/Dashboard/AdminSectionErrorBoundary";

const menuItems = [
  { id: "overview", label: "Platform Overview", icon: LayoutDashboard },
  { id: "profile", label: "My Profile", icon: ShieldCheck },
  { id: "approvals", label: "Hackathon Approvals", icon: ClipboardList },
  { id: "manage", label: "Manage Users & Organizers", icon: Users },
  { id: "activity", label: "Activity Log", icon: Activity }
];

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const userRole = localStorage.getItem("userRole");
    const userName = localStorage.getItem("userName");

    if (!userId || userRole !== "admin") {
      setAuthChecked(true);
      navigate("/login-admin");
      return;
    }

    setUser({
      id: userId,
      name: userName || "Admin",
      role: userRole
    });
    setAuthChecked(true);
  }, [navigate]);

  const confirmLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    navigate("/");
  };

  if (!authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(244,63,94,0.14),transparent_24%),linear-gradient(180deg,#fff1f2,#fff7ed_40%,#f8fafc)]">
        <div className="rounded-[28px] border border-white/70 bg-white/85 px-6 py-5 text-sm font-medium text-slate-600 shadow-[0_24px_90px_rgba(15,23,42,0.08)] backdrop-blur">
          Loading admin dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(244,63,94,0.14),transparent_24%),linear-gradient(180deg,#fff1f2,#fff7ed_40%,#f8fafc)] animate-pageLoad">
      <aside
        className={`${
          sidebarOpen ? "w-72" : "w-20"
        } relative flex flex-col overflow-y-auto border-r border-white/20 bg-gradient-to-b from-rose-600 via-red-500 to-fuchsia-600 text-white transition-all duration-300 shadow-2xl`}
      >
        <div className="flex items-center justify-between p-4">
          <h1 className={`${!sidebarOpen ? "hidden" : ""} text-xl font-bold`}>HackHunt</h1>
          <button
            type="button"
            onClick={() => setSidebarOpen((value) => !value)}
            className="rounded-lg p-1 transition hover:bg-pink-500"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <div className="border-b border-pink-400 px-4 py-6">
          <div className={`flex items-center ${!sidebarOpen ? "justify-center" : ""}`}>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-300 font-bold text-pink-900">
              {user?.name?.charAt(0)?.toUpperCase() || "A"}
            </div>
            {sidebarOpen && (
              <div className="ml-3">
                <p className="text-sm font-semibold">{user?.name}</p>
                <p className="text-xs text-pink-100">Administrator</p>
              </div>
            )}
          </div>
        </div>

        <nav className="mt-6 flex flex-1 flex-col space-y-2 px-2">
          {menuItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveSection(item.id)}
                className={`flex w-full items-center space-x-3 rounded-lg px-4 py-3 text-left transition duration-300 transform hover:scale-105 ${
                  activeSection === item.id
                    ? "bg-white font-semibold text-red-600 shadow-lg scale-105"
                    : "text-white hover:bg-red-500"
                } animate-slideInLeft`}
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <Icon size={18} className="shrink-0 transition duration-300" />
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto px-2 pb-4 pt-6">
          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            className="flex w-full items-center justify-center space-x-2 rounded-lg bg-red-700 px-4 py-3 text-white transition duration-200 hover:bg-red-800"
          >
            <LogOut size={18} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl p-6 md:p-8">

          <div className="mb-8 rounded-[30px] border border-white/70 bg-white/80 px-6 py-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur animate-slideDown">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 transition-all duration-300">
              {menuItems.find((item) => item.id === activeSection)?.label || "Admin Dashboard"}
            </h2>
            <p className="mt-2 text-slate-600 transition-all duration-300">
              Welcome back, {user?.name}! Review platform activity, users, and approvals from one place.
            </p>
          </div>

          <div className="rounded-[32px] border border-white/70 bg-white/85 p-6 shadow-[0_24px_90px_rgba(15,23,42,0.08)] backdrop-blur md:p-8">
            <AdminSectionErrorBoundary>
            <div className="animate-fadeIn transition-all duration-500">
              {activeSection === "overview" && <div className="animate-slideUp"><AdminOverview /></div>}
              {activeSection === "profile" && <div className="animate-slideUp"><AdminProfile user={user} /></div>}
              {activeSection === "approvals" && <div className="animate-slideUp"><HackathonApprovals /></div>}
              {activeSection === "manage" && <div className="animate-slideUp"><ManageUsers user={user} /></div>}
              {activeSection === "activity" && <div className="animate-slideUp"><AdminActivityLog /></div>}
            </div>
            </AdminSectionErrorBoundary>
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

export default AdminDashboard;
