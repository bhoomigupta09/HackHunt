import React, { useEffect, useState } from "react";
import { AlertCircle, Check, Search, Shield, Trash2, Users } from "lucide-react";
import { apiClient } from "../../api/client";
import { useRealtimeStream } from "../../hooks/useRealtimeStream";

const ManageUsers = ({ user }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [workingUserId, setWorkingUserId] = useState("");

  const adminId = localStorage.getItem("userId");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await apiClient.fetchDirectory();
      setUsers(response.users || []);
    } catch (err) {
      setError(err.message || "Failed to load users.");
      console.error("Error loading users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useRealtimeStream({
    "user:created": fetchUsers,
    "user:deleted": fetchUsers,
    "user:status-updated": fetchUsers,
    "user:blocked": fetchUsers,
    "user:unblocked": fetchUsers
  });

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return;
    }

    try {
      setWorkingUserId(userId);
      setError("");
      await apiClient.deleteUser(userId, adminId);
      setSuccess("User deleted successfully.");
      setTimeout(() => setSuccess(""), 3000);
      await fetchUsers();
    } catch (err) {
      setError(err.message || "Failed to delete user.");
    } finally {
      setWorkingUserId("");
    }
  };

  const handleBlockUser = async (userId, currentlyBlocked) => {
    try {
      setWorkingUserId(userId);
      setError("");

      const action = currentlyBlocked ? "unblock" : "block";
      const isActive = currentlyBlocked;
      await apiClient.blockUser(userId, isActive, adminId);

      setSuccess(`User ${action}ed successfully.`);
      setTimeout(() => setSuccess(""), 3000);
      await fetchUsers();
    } catch (err) {
      setError(err.message || `Failed to ${currentlyBlocked ? "unblock" : "block"} user.`);
    } finally {
      setWorkingUserId("");
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      (u.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = filterRole === "all" || u.role === filterRole;
    const matchesStatus = filterStatus === "all" || u.status === filterStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const stats = {
    total: users.length,
    organizers: users.filter((u) => u.role === "organizer").length,
    active: users.filter((u) => u.status === "active").length,
    blocked: users.filter((u) => u.status === "blocked").length
  };

  if (loading) {
    return <div className="py-16 text-center text-slate-500 dark:text-slate-400">Loading users...</div>;
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 rounded-[24px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-[24px] border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 shadow-sm dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
          <Check size={18} />
          {success}
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-[26px] border border-slate-200 bg-slate-50 px-5 py-5 shadow-sm dark:border-white/10 dark:bg-slate-800/70">
          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-600 dark:text-slate-400">Total Users</div>
          <div className="mt-3 text-4xl font-bold text-slate-950 dark:text-slate-50">{stats.total}</div>
        </div>
        <div className="rounded-[26px] border border-blue-200 bg-blue-50 px-5 py-5 shadow-sm dark:border-blue-500/20 dark:bg-blue-500/10">
          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Organizers</div>
          <div className="mt-3 text-4xl font-bold text-slate-950 dark:text-slate-50">{stats.organizers}</div>
        </div>
        <div className="rounded-[26px] border border-emerald-200 bg-emerald-50 px-5 py-5 shadow-sm dark:border-emerald-500/20 dark:bg-emerald-500/10">
          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Active</div>
          <div className="mt-3 text-4xl font-bold text-slate-950 dark:text-slate-50">{stats.active}</div>
        </div>
        <div className="rounded-[26px] border border-red-200 bg-red-50 px-5 py-5 shadow-sm dark:border-red-500/20 dark:bg-red-500/10">
          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-red-600">Blocked</div>
          <div className="mt-3 text-4xl font-bold text-slate-950 dark:text-slate-50">{stats.blocked}</div>
        </div>
      </section>

      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-slate-900/75 dark:shadow-[0_18px_60px_rgba(2,6,23,0.45)]">
        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 py-3 pl-10 pr-4 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 dark:border-white/10 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Filter by Role</label>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 dark:border-white/10 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="all">All Roles</option>
                <option value="user">Users</option>
                <option value="organizer">Organizers</option>
                <option value="admin">Admins</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Filter by Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 dark:border-white/10 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((u) => (
            <div
              key={u.id}
              className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_80px_rgba(15,23,42,0.12)] dark:border-white/10 dark:bg-slate-900/75 dark:shadow-[0_18px_60px_rgba(2,6,23,0.45)]"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-red-400 to-pink-500 font-bold text-white">
                      {(u.name || "U")[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{u.name || "Unknown User"}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{u.email}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        u.role === "admin"
                          ? "bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300"
                          : u.role === "organizer"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300"
                          : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      }`}
                    >
                      {u.role || "user"}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        u.status === "active"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                          : "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300"
                      }`}
                    >
                      {u.status || "active"}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleBlockUser(u.id, u.status === "blocked")}
                    disabled={workingUserId === u.id}
                    className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-70 ${
                      u.status === "blocked"
                        ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:hover:bg-emerald-500/15"
                        : "bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-500/15"
                    }`}
                  >
                    <Shield size={16} />
                    {workingUserId === u.id ? "Processing..." : u.status === "blocked" ? "Unblock" : "Block"}
                  </button>

                  <button
                    onClick={() => handleDeleteUser(u.id)}
                    disabled={workingUserId === u.id}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-500 px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <Trash2 size={16} />
                    {workingUserId === u.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-[24px] border border-dashed border-slate-300 bg-white px-6 py-16 text-center text-slate-500 dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-400">
            <Users className="mx-auto mb-4 h-10 w-10 text-slate-300 dark:text-slate-600" />
            <p className="font-medium">No users found matching your filters.</p>
            <p className="mt-2 text-sm">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageUsers;
