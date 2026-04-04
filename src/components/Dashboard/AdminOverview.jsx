import React, { useEffect, useMemo, useState } from "react";
import { Activity, ShieldCheck, Sparkles, Users } from "lucide-react";
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
    return <div className="py-16 text-center text-slate-500 dark:text-slate-400">Loading platform overview...</div>;
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="rounded-[24px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </div>
      )}

      <section className="rounded-[30px] border border-rose-100 bg-[radial-gradient(circle_at_top_left,rgba(244,63,94,0.18),transparent_28%),linear-gradient(135deg,#fff1f2,#ffffff)] p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-[radial-gradient(circle_at_top_left,rgba(244,63,94,0.14),transparent_28%),linear-gradient(135deg,rgba(30,41,59,0.96),rgba(15,23,42,0.9))] dark:shadow-[0_24px_80px_rgba(2,6,23,0.45)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-rose-700 dark:bg-rose-500/15 dark:text-rose-300">
              <Sparkles size={14} />
              Admin analytics
            </div>
            <h3 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 dark:text-slate-50">Platform Overview</h3>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">
              Monitor platform activity, account growth, and the review pipeline from one place.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[24px] border border-white/80 bg-white/90 px-5 py-5 shadow-sm dark:border-white/10 dark:bg-slate-800/80">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-500">Accounts</div>
            <div className="mt-2 text-4xl font-bold text-slate-950 dark:text-slate-50">{displayStats.users}</div>
          </div>
          <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 px-5 py-5 shadow-sm dark:border-emerald-500/20 dark:bg-emerald-500/10">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">Active Users</div>
            <div className="mt-2 text-4xl font-bold text-slate-950 dark:text-slate-50">{displayStats.activeUsers}</div>
          </div>
          <div className="rounded-[24px] border border-amber-200 bg-amber-50 px-5 py-5 shadow-sm dark:border-amber-500/20 dark:bg-amber-500/10">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-600">Pending Review</div>
            <div className="mt-2 text-4xl font-bold text-slate-950 dark:text-slate-50">{displayStats.pendingHackathons}</div>
          </div>
          <div className="rounded-[24px] border border-blue-200 bg-blue-50 px-5 py-5 shadow-sm dark:border-blue-500/20 dark:bg-blue-500/10">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">Approved Live</div>
            <div className="mt-2 text-4xl font-bold text-slate-950 dark:text-slate-50">{displayStats.approvedHackathons}</div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] transition-all duration-300 hover:shadow-[0_18px_80px_rgba(15,23,42,0.12)] dark:border-white/10 dark:bg-slate-900/75 dark:shadow-[0_18px_60px_rgba(2,6,23,0.45)]">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300">
              <Users size={18} />
            </div>
            <div>
              <h4 className="text-xl font-bold text-slate-950 dark:text-slate-50">Recent Accounts</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">Latest users joining the platform.</p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {recentAccounts.length > 0 ? (
              recentAccounts.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-800/70">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{item.name}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{item.email}</p>
                    <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                      Joined: {item.joinDate ? new Date(item.joinDate).toLocaleDateString() : "N/A"} | Last login: {item.lastLogin ? new Date(item.lastLogin).toLocaleString() : "Never"}
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold capitalize text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                    {item.role || "user"}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">No recent accounts</p>
            )}
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] transition-all duration-300 hover:shadow-[0_18px_80px_rgba(15,23,42,0.12)] dark:border-white/10 dark:bg-slate-900/75 dark:shadow-[0_18px_60px_rgba(2,6,23,0.45)]">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-500/15 dark:text-fuchsia-300">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h4 className="text-xl font-bold text-slate-950 dark:text-slate-50">Review Queue Snapshot</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">Hackathons currently moving through approvals.</p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {hackathons.slice(0, 5).length > 0 ? (
              hackathons.slice(0, 5).map((item) => (
                <div key={item._id || item.id} className="rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-800/70">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{item.title}</p>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                        item.approvalStatus === "approved"
                          ? "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300"
                          : item.approvalStatus === "pending"
                          ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-300"
                          : "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300"
                      }`}
                    >
                      {item.approvalStatus || item.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{item.organizerName}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">No hackathons yet</p>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-slate-900/75 dark:shadow-[0_18px_60px_rgba(2,6,23,0.45)]">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
              <Activity size={18} />
            </div>
            <div>
              <h4 className="text-xl font-bold text-slate-950 dark:text-slate-50">Platform health</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">Quick UI snapshot for operations monitoring.</p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 px-4 py-4 dark:bg-slate-800/70">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Reports</p>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">{hackathons.filter((item) => item.approvalStatus === "rejected").length}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-4 dark:bg-slate-800/70">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Approvals</p>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">{displayStats.pendingHackathons}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-4 dark:bg-slate-800/70">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Live</p>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">{displayStats.approvedHackathons}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-dashed border-slate-300 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <Sparkles size={18} />
            </div>
            <div>
              <h4 className="text-xl font-bold text-slate-950 dark:text-slate-50">Approval Requests</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">Highlighted to keep moderation decisions front and center.</p>
            </div>
          </div>
          <div className="mt-5 rounded-[24px] bg-gradient-to-r from-rose-500 to-fuchsia-600 px-5 py-5 text-white shadow-lg shadow-rose-500/20">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">Needs attention</p>
            <p className="mt-2 text-4xl font-bold">{displayStats.pendingHackathons}</p>
            <p className="mt-2 text-sm text-white/80">Pending approvals waiting for admin review.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminOverview;
