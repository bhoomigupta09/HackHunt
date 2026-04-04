import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Compass,
  LayoutGrid,
  LogOut,
  MapPinned,
  Menu,
  Moon,
  Sun,
  UserRound
} from "lucide-react";
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
  const [user, setUser] = useState({ name: "User", role: "user", id: "" });
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("hackhunt-user-theme") || "light");
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const userRole = localStorage.getItem("userRole");
    const userName = localStorage.getItem("userName");

    if (!userId || userRole !== "user") {
      navigate("/login?role=user");
      return;
    }

    setUser({
      id: userId,
      name: userName && userName !== "undefined" ? userName : "User",
      role: userRole
    });
  }, [navigate]);

  useEffect(() => {
    if (sectionFromQuery && ["profile", "browse", "registered", "track"].includes(sectionFromQuery)) {
      setActiveSection(sectionFromQuery);
    }
  }, [sectionFromQuery]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    document.body.classList.toggle("dark", theme === "dark");
    localStorage.setItem("hackhunt-user-theme", theme);
  }, [theme]);

  const switchSection = (sectionId) => {
    setActiveSection(sectionId);
    if (sectionId === "browse" && locationFromQuery) {
      navigate(`/dashboard/user?section=${sectionId}&location=${encodeURIComponent(locationFromQuery)}`);
      return;
    }
    navigate(`/dashboard/user?section=${sectionId}`);
  };

  const confirmLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const menuItems = useMemo(
    () => [
      { id: "profile", label: "My Profile", icon: UserRound },
      { id: "browse", label: "Browse Hackathons", icon: Compass },
      { id: "registered", label: "My Registrations", icon: LayoutGrid },
      { id: "track", label: "Track Hackathons", icon: MapPinned }
    ],
    []
  );

  const activeMenuItem = menuItems.find((item) => item.id === activeSection);
  const isDark = theme === "dark";

  return (
    <div className="relative flex h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.22),transparent_25%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.16),transparent_22%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_52%,#f8fafc_100%)] text-slate-900 transition-colors duration-300 dark:bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.16),transparent_25%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.14),transparent_22%),linear-gradient(180deg,#020617_0%,#0f172a_50%,#111827_100%)] dark:text-slate-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-8rem] top-[-6rem] h-72 w-72 rounded-full bg-fuchsia-400/20 blur-3xl" />
        <div className="absolute bottom-[-8rem] right-[-5rem] h-80 w-80 rounded-full bg-blue-400/20 blur-3xl" />
      </div>

      {sidebarOpen && (
        <button
          aria-label="Close sidebar overlay"
          className="fixed inset-0 z-30 bg-slate-950/30 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-screen w-[290px] max-w-[85vw] flex-col border-r border-white/20 bg-white/12 px-4 py-4 text-white shadow-[0_30px_80px_rgba(15,23,42,0.24)] backdrop-blur-2xl transition-transform duration-300 lg:relative lg:h-full lg:w-80 lg:max-w-none lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:w-24 lg:translate-x-0"
        }`}
      >
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(109,40,217,0.92),rgba(91,33,182,0.84),rgba(49,46,129,0.9))]" />
        <div className="relative flex h-full flex-col">
          <div className="flex items-center justify-between gap-3 px-2 pb-5">
            <div className={`overflow-hidden transition-all duration-300 ${sidebarOpen ? "opacity-100" : "opacity-0 lg:w-0"}`}>
              <p className="bg-gradient-to-r from-white via-violet-100 to-fuchsia-100 bg-clip-text text-lg font-black uppercase tracking-[0.42em] text-transparent drop-shadow-[0_4px_18px_rgba(255,255,255,0.26)]">
                HackHunt
              </p>
            </div>
            <button
              onClick={() => setTheme((prev) => (prev === "light" ? "dark" : "light"))}
              className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-white shadow-lg shadow-violet-950/20 transition duration-300 hover:scale-[1.03] hover:bg-white/20 ${
                !sidebarOpen ? "lg:mx-auto" : ""
              }`}
              aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
            >
              <span className="relative flex h-5 w-5 items-center justify-center">
                <Sun
                  size={18}
                  className={`absolute transition-all duration-300 ${isDark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"}`}
                />
                <Moon
                  size={18}
                  className={`absolute transition-all duration-300 ${isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"}`}
                />
              </span>
            </button>
          </div>

          <div
            className={`rounded-[28px] border border-white/15 bg-white/10 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.2)] transition-all duration-300 ${
              sidebarOpen ? "opacity-100" : "opacity-0 lg:px-0 lg:py-4"
            }`}
          >
            <div className={`flex items-center gap-4 ${sidebarOpen ? "" : "lg:justify-center"}`}>
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-fuchsia-400 to-cyan-300 blur-sm opacity-90" />
                <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-slate-950/35 text-xl font-semibold text-white ring-2 ring-white/70">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
              </div>
              {sidebarOpen && (
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold text-white">{user?.name || "User"}</p>
                  <p className="mt-1 truncate text-xs font-medium uppercase tracking-[0.24em] text-white/65">
                    User Account
                  </p>
                </div>
              )}
            </div>
          </div>

          <nav className="mt-6 flex-1 space-y-2 overflow-y-auto pr-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    switchSection(item.id);
                    if (window.innerWidth < 1024) {
                      setSidebarOpen(false);
                    }
                  }}
                  className={`group relative flex w-full items-center gap-4 overflow-hidden rounded-[22px] px-4 py-3.5 text-left transition-all duration-300 ${
                    isActive
                      ? "bg-white text-violet-700 shadow-[0_18px_35px_rgba(255,255,255,0.16)]"
                      : "text-white/88 hover:bg-white/12 hover:text-white"
                  } ${sidebarOpen ? "" : "lg:justify-center lg:px-0"}`}
                >
                  {isActive && (
                    <div className="absolute inset-0 rounded-[22px] bg-[radial-gradient(circle_at_left,rgba(168,85,247,0.14),transparent_55%)]" />
                  )}
                  <span
                    className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-all duration-300 ${
                      isActive
                        ? "bg-gradient-to-br from-violet-100 to-fuchsia-100 text-violet-700 shadow-lg shadow-violet-500/20"
                        : "bg-white/10 text-white group-hover:bg-white/20"
                    }`}
                  >
                    <Icon size={18} />
                  </span>
                  {sidebarOpen && (
                    <span className="relative min-w-0 truncate text-sm font-semibold">{item.label}</span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="mt-4 rounded-[24px] border border-white/15 bg-white/10 p-3">
            {sidebarOpen ? (
              <div>
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 via-fuchsia-500 to-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_35px_rgba(217,70,239,0.35)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_40px_rgba(217,70,239,0.42)]"
                >
                  <LogOut size={17} />
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="mx-auto inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-r from-rose-500 to-fuchsia-600 text-white shadow-lg shadow-fuchsia-900/30"
              >
                <LogOut size={17} />
              </button>
            )}
          </div>
        </div>
      </aside>

      <main className="relative z-10 flex-1 overflow-y-auto">
        <div className="mx-auto flex min-h-full max-w-[1600px] flex-col px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
          <div className="mb-5 flex items-center justify-between lg:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/60 bg-white/80 text-slate-700 shadow-lg shadow-slate-200/60 backdrop-blur transition-colors duration-300 dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-100 dark:shadow-slate-950/40"
            >
              <Menu size={18} />
            </button>
            <div className="rounded-2xl border border-white/60 bg-white/70 px-4 py-2 text-sm font-medium text-slate-600 shadow-lg shadow-slate-200/40 backdrop-blur transition-colors duration-300 dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-200 dark:shadow-slate-950/40">
              {activeMenuItem?.label}
            </div>
            <button
              onClick={() => setTheme((prev) => (prev === "light" ? "dark" : "light"))}
              className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/60 bg-white/80 text-slate-700 shadow-lg shadow-slate-200/60 backdrop-blur transition-colors duration-300 dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-100 dark:shadow-slate-950/40 lg:hidden"
              aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>

          <section className="relative overflow-hidden rounded-[32px] border border-white/65 bg-white/72 px-6 py-6 shadow-[0_28px_90px_rgba(15,23,42,0.08)] backdrop-blur-xl transition-colors duration-300 dark:border-white/10 dark:bg-slate-900/65 dark:shadow-[0_28px_90px_rgba(2,6,23,0.45)] sm:px-8 sm:py-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(167,139,250,0.22),transparent_24%),linear-gradient(135deg,rgba(255,255,255,0.88),rgba(244,244,255,0.72))] dark:bg-[radial-gradient(circle_at_top_right,rgba(167,139,250,0.18),transparent_24%),linear-gradient(135deg,rgba(30,41,59,0.9),rgba(15,23,42,0.72))]" />
            <div className="relative">
              <div className="max-w-3xl">
                <h2 className="text-3xl font-semibold tracking-[-0.04em] text-slate-950 transition-colors duration-300 dark:text-slate-50 sm:text-4xl">
                  {activeMenuItem?.label}
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 transition-colors duration-300 dark:text-slate-300 sm:text-base">
                  Welcome back, {user?.name || "User"}. Manage your profile, discover curated hackathons, review registrations,
                  and track events through one polished workspace.
                </p>
              </div>
            </div>
          </section>

          <section className="mt-6 flex-1 rounded-[34px] border border-white/65 bg-white/70 p-4 shadow-[0_28px_110px_rgba(15,23,42,0.08)] backdrop-blur-xl transition-colors duration-300 dark:border-white/10 dark:bg-slate-900/60 dark:shadow-[0_28px_110px_rgba(2,6,23,0.5)] sm:p-6 lg:p-8">
            {activeSection === "profile" && <MyProfile user={user} />}
            {activeSection === "browse" && <BrowseHackathons user={user} initialSearchTerm={locationFromQuery} />}
            {activeSection === "registered" && <RegisteredHackathons user={user} />}
            {activeSection === "track" && <HackathonTrackingMap />}
          </section>
        </div>
      </main>

      <LogoutConfirmModal
        open={showLogoutConfirm}
        onCancel={() => setShowLogoutConfirm(false)}
        onConfirm={confirmLogout}
      />
    </div>
  );
};

export default UserDashboard;
