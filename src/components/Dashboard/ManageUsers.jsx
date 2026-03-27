import React, { useEffect, useState } from "react";
import { Search, Trash2, Shield, AlertCircle, Check } from "lucide-react";
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
      const isActive = currentlyBlocked; // If currently blocked, set to active (true)
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
    organizers: users.filter(u => u.role === "organizer").length,
    active: users.filter(u => u.status === "active").length,
    blocked: users.filter(u => u.status === "blocked").length
  };

  if (loading) {
    return <div className="py-16 text-center text-slate-500 animate-fadeIn">Loading users...</div>;
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 flex items-center gap-2">
          <Check size={18} />
          {success}
        </div>
      )}

      {/* Stats Section */}
      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-[26px] border border-slate-200 bg-slate-50 px-5 py-5 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:scale-105 animate-slideUp" style={{ animationDelay: '0ms' }}>
          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-600">Total Users</div>
          <div className="mt-3 text-4xl font-bold text-slate-950 transition-all duration-500">{stats.total}</div>
        </div>
        <div className="rounded-[26px] border border-blue-200 bg-blue-50 px-5 py-5 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:scale-105 animate-slideUp" style={{ animationDelay: '100ms' }}>
          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Organizers</div>
          <div className="mt-3 text-4xl font-bold text-slate-950 transition-all duration-500">{stats.organizers}</div>
        </div>
        <div className="rounded-[26px] border border-emerald-200 bg-emerald-50 px-5 py-5 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:scale-105 animate-slideUp" style={{ animationDelay: '200ms' }}>
          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Active</div>
          <div className="mt-3 text-4xl font-bold text-slate-950 transition-all duration-500">{stats.active}</div>
        </div>
        <div className="rounded-[26px] border border-red-200 bg-red-50 px-5 py-5 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:scale-105 animate-slideUp" style={{ animationDelay: '300ms' }}>
          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-red-600">Blocked</div>
          <div className="mt-3 text-4xl font-bold text-slate-950 transition-all duration-500">{stats.blocked}</div>
        </div>
      </section>

      {/* Search & Filter Section */}
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] animate-slideUp transition-all duration-300 hover:shadow-[0_18px_80px_rgba(15,23,42,0.12)]">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-300"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Filter by Role</label>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-300"
              >
                <option value="all">All Roles</option>
                <option value="user">Users</option>
                <option value="organizer">Organizers</option>
                <option value="admin">Admins</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Filter by Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-300"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Users List Section */}
      <div className="space-y-3">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((u, idx) => (
            <div
              key={u.id}
              className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] hover:shadow-[0_18px_80px_rgba(15,23,42,0.12)] transition-all duration-300 transform hover:translate-x-1 animate-slideUp"
              style={{ animationDelay: `${Math.min(idx * 40, 300)}ms` }}
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-400 to-pink-500 flex items-center justify-center text-white font-bold">
                      {(u.name || "U")[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{u.name || "Unknown User"}</p>
                      <p className="text-sm text-slate-500">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      u.role === "admin"
                        ? "bg-purple-100 text-purple-700"
                        : u.role === "organizer"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-slate-100 text-slate-700"
                    }`}>
                      {u.role || "user"}
                    </span>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      u.status === "active"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-700"
                    }`}>
                      {u.status || "active"}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleBlockUser(u.id, u.status === "blocked")}
                    disabled={workingUserId === u.id}
                    className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed ${
                      u.status === "blocked"
                        ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:shadow-lg"
                        : "bg-red-50 text-red-700 hover:bg-red-100 hover:shadow-lg"
                    }`}
                  >
                    <Shield size={16} />
                    {workingUserId === u.id ? "Processing..." : u.status === "blocked" ? "Unblock" : "Block"}
                  </button>

                  <button
                    onClick={() => handleDeleteUser(u.id)}
                    disabled={workingUserId === u.id}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-500 text-white px-4 py-2 text-sm font-semibold transition-all duration-300 transform hover:scale-105 hover:bg-red-600 hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    <Trash2 size={16} />
                    {workingUserId === u.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-[24px] border border-dashed border-slate-300 bg-white px-6 py-16 text-center text-slate-500 animate-fadeIn">
            <p className="font-medium">No users found matching your filters.</p>
            <p className="text-sm mt-2">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageUsers;
