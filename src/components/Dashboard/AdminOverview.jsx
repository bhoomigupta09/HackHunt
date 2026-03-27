import React, { useEffect, useMemo, useState } from "react";
import { apiClient } from "../../api/client";
import { useRealtimeStream } from "../../hooks/useRealtimeStream";

const AdminOverview = () => {
  const [stats, setStats] = useState(null);
  const [recentAccounts, setRecentAccounts] = useState([]);
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const adminId = localStorage.getItem("userId");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      if (!adminId) {
        setError("Admin not logged in");
        return;
      }

      const [statsResult, usersResult, hackathonsResult] = await Promise.allSettled([
        apiClient.getPlatformStats(adminId),
        apiClient.getAllUsers(adminId, { page: 1, limit: 5 }),
        apiClient.getAdminHackathons()
      ]);

      if (statsResult.status === "fulfilled") {
        setStats(statsResult.value.stats || statsResult.value);
      }
      if (usersResult.status === "fulfilled") {
        setRecentAccounts(usersResult.value.users || []);
      }
      if (hackathonsResult.status === "fulfilled") {
        setHackathons(hackathonsResult.value.hackathons || []);
      }

      const failedCount = [statsResult, usersResult, hackathonsResult].filter(
        (result) => result.status === "rejected"
      ).length;
      if (failedCount === 3) {
        setError("Unable to connect to backend API. Please ensure backend server is running on port 5000.");
      }
    } catch (err) {
      setError(err.message || "Failed to load platform overview.");
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useRealtimeStream({
    "user:created": loadData,
    "user:deleted": loadData,
    "user:status-updated": loadData,
    "hackathon:created": loadData,
    "hackathon:updated": loadData,
    "hackathon:deleted": loadData,
    "hackathon:approval-updated": loadData
  });

  const displayStats = useMemo(() => {
    if (!stats) {
      return {
        users: 0,
        activeUsers: 0,
        pendingHackathons: 0,
        approvedHackathons: 0
      };
    }

    return {
      users: stats.users?.total || stats.totalUsers || 0,
      activeUsers: stats.users?.active || stats.activeUsers || 0,
      pendingHackathons: stats.hackathons?.pending || stats.pendingApprovals || 0,
      approvedHackathons: stats.hackathons?.approved || stats.approvedHackathons || 0
    };
  }, [stats]);

  if (loading) {
    return <div className="py-16 text-center text-slate-500">Loading platform overview...</div>;
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="rounded-[30px] border border-rose-100 bg-[radial-gradient(circle_at_top_left,rgba(244,63,94,0.18),transparent_28%),linear-gradient(135deg,#fff1f2,#ffffff)] p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] animate-slideDown">
        <h3 className="text-3xl font-bold tracking-tight text-slate-950">Platform Overview</h3>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
          Monitor platform activity, account growth, and the review pipeline from one place.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-white/80 bg-white/90 px-5 py-5 hover:shadow-lg transition-all duration-300 transform hover:scale-105 animate-slideUp" style={{ animationDelay: '0ms' }}>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Accounts</div>
            <div className="mt-2 text-4xl font-bold text-slate-950 transition-all duration-500">{displayStats.users}</div>
          </div>
          <div className="rounded-2xl border border-white/80 bg-white/90 px-5 py-5 hover:shadow-lg transition-all duration-300 transform hover:scale-105 animate-slideUp" style={{ animationDelay: '100ms' }}>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">Active Users</div>
            <div className="mt-2 text-4xl font-bold text-slate-950 transition-all duration-500">{displayStats.activeUsers}</div>
          </div>
          <div className="rounded-2xl border border-white/80 bg-white/90 px-5 py-5 hover:shadow-lg transition-all duration-300 transform hover:scale-105 animate-slideUp" style={{ animationDelay: '200ms' }}>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-600">Pending Review</div>
            <div className="mt-2 text-4xl font-bold text-slate-950 transition-all duration-500">{displayStats.pendingHackathons}</div>
          </div>
          <div className="rounded-2xl border border-white/80 bg-white/90 px-5 py-5 hover:shadow-lg transition-all duration-300 transform hover:scale-105 animate-slideUp" style={{ animationDelay: '300ms' }}>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">Approved Live</div>
            <div className="mt-2 text-4xl font-bold text-slate-950 transition-all duration-500">{displayStats.approvedHackathons}</div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] animate-slideUp transition-all duration-300 hover:shadow-[0_18px_80px_rgba(15,23,42,0.12)]">
          <h4 className="text-xl font-bold text-slate-950 mb-4 animate-fadeIn">Recent Accounts</h4>
          <div className="mt-5 space-y-3">
            {recentAccounts.length > 0 ? (
              recentAccounts.map((item, idx) => (
                <div key={item.id} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 hover:bg-slate-100 transition-all duration-300 transform hover:translate-x-1 animate-slideUp" style={{ animationDelay: `${idx * 50}ms` }}>
                  <div>
                    <p className="font-semibold text-slate-900">{item.name}</p>
                    <p className="text-sm text-slate-500">{item.email}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      Joined: {item.joinDate ? new Date(item.joinDate).toLocaleDateString() : "N/A"} | Last login: {item.lastLogin ? new Date(item.lastLogin).toLocaleString() : "Never"}
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold capitalize text-slate-700 transition-all duration-300">
                    {item.role || "user"}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No recent accounts</p>
            )}
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] animate-slideUp transition-all duration-300 hover:shadow-[0_18px_80px_rgba(15,23,42,0.12)]">
          <h4 className="text-xl font-bold text-slate-950 mb-4 animate-fadeIn">Review Queue Snapshot</h4>
          <div className="mt-5 space-y-3">
            {hackathons.slice(0, 5).length > 0 ? (
              hackathons.slice(0, 5).map((item, idx) => (
                <div key={item._id || item.id} className="rounded-2xl bg-slate-50 px-4 py-3 hover:bg-slate-100 transition-all duration-300 transform hover:translate-x-1 animate-slideUp" style={{ animationDelay: `${idx * 50}ms` }}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-slate-900">{item.title}</p>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize transition-all duration-300 ${
                      item.approvalStatus === 'approved' ? 'bg-green-100 text-green-700' :
                      item.approvalStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {item.approvalStatus || item.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">{item.organizerName}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No hackathons yet</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminOverview;
