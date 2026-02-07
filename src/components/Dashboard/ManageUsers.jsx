import React, { useState } from "react";
import { Search, Trash2, Eye, Edit2, Shield, Ban, CheckCircle } from "lucide-react";

const ManageUsers = ({ user }) => {
  const [users, setUsers] = useState([
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      role: "user",
      joinDate: "2025-12-15",
      status: "active",
      hackathonsJoined: 5,
      registrations: 3
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@organization.com",
      role: "organizer",
      joinDate: "2025-11-20",
      status: "active",
      hackathonsCreated: 5,
      participants: 145
    },
    {
      id: 3,
      name: "Mike Johnson",
      email: "mike@example.com",
      role: "user",
      joinDate: "2025-10-10",
      status: "active",
      hackathonsJoined: 3,
      registrations: 2
    },
    {
      id: 4,
      name: "Sarah Williams",
      email: "sarah@techstartup.com",
      role: "organizer",
      joinDate: "2025-09-05",
      status: "active",
      hackathonsCreated: 3,
      participants: 89
    },
    {
      id: 5,
      name: "Alex Brown",
      email: "alex@example.com",
      role: "user",
      joinDate: "2025-08-12",
      status: "inactive",
      hackathonsJoined: 1,
      registrations: 1
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || u.role === filterRole;
    const matchesStatus = filterStatus === "all" || u.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleDeleteUser = (id) => {
    if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
    }
  };

  const handleToggleStatus = (id) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? { ...u, status: u.status === "active" ? "inactive" : "active" }
          : u
      )
    );
  };

  const handleViewUser = (userData) => {
    setSelectedUser(userData);
    setShowModal(true);
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "user":
        return "bg-blue-100 text-blue-800";
      case "organizer":
        return "bg-amber-100 text-amber-800";
      case "admin":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status) => {
    return status === "active"
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-2xl font-bold text-gray-800">User & Organizer Management</h3>
        <p className="text-gray-600 mt-1">Monitor and manage all users and organizers on the platform</p>
      </div>

      {/* Filters and Search */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search Box */}
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        {/* Role Filter */}
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <option value="all">All Roles</option>
          <option value="user">Users</option>
          <option value="organizer">Organizers</option>
        </select>

        {/* Status Filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Role</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Join Date</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Activity</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((userData) => (
                <tr key={userData.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-sm font-medium text-gray-800">{userData.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{userData.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getRoleBadgeColor(userData.role)}`}>
                      {userData.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize flex items-center w-fit space-x-1 ${getStatusColor(userData.status)}`}>
                      {userData.status === "active" ? (
                        <CheckCircle size={14} />
                      ) : (
                        <Ban size={14} />
                      )}
                      <span>{userData.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(userData.joinDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {userData.role === "user" ? (
                      <span>{userData.hackathonsJoined} hackathons</span>
                    ) : (
                      <span>{userData.hackathonsCreated} created</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewUser(userData)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(userData.id)}
                        className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition"
                        title={userData.status === "active" ? "Deactivate" : "Activate"}
                      >
                        <Shield size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(userData.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete User"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center text-gray-600">
                  No users found matching your filters
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal - User Details */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-800">{selectedUser.name}</h3>
                <p className="text-sm text-gray-600">{selectedUser.email}</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-4 space-y-6">
              {/* User Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600">Role</label>
                  <p className="text-sm font-medium text-gray-800 mt-1 capitalize">{selectedUser.role}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600">Status</label>
                  <p className={`text-sm font-medium mt-1 capitalize ${selectedUser.status === "active" ? "text-green-600" : "text-red-600"}`}>
                    {selectedUser.status}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600">Join Date</label>
                  <p className="text-sm font-medium text-gray-800 mt-1">
                    {new Date(selectedUser.joinDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600">Activity</label>
                  {selectedUser.role === "user" ? (
                    <p className="text-sm font-medium text-gray-800 mt-1">{selectedUser.hackathonsJoined} hackathons</p>
                  ) : (
                    <p className="text-sm font-medium text-gray-800 mt-1">{selectedUser.hackathonsCreated} created</p>
                  )}
                </div>
              </div>

              {/* Detailed Stats */}
              {selectedUser.role === "user" ? (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-3">User Statistics</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-blue-700">Hackathons Joined</p>
                      <p className="text-2xl font-bold text-blue-600">{selectedUser.hackathonsJoined}</p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-700">Active Registrations</p>
                      <p className="text-2xl font-bold text-blue-600">{selectedUser.registrations}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-amber-900 mb-3">Organizer Statistics</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-amber-700">Hackathons Created</p>
                      <p className="text-2xl font-bold text-amber-600">{selectedUser.hackathonsCreated}</p>
                    </div>
                    <div>
                      <p className="text-xs text-amber-700">Total Participants</p>
                      <p className="text-2xl font-bold text-amber-600">{selectedUser.participants}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex space-x-2 justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleToggleStatus(selectedUser.id);
                  setShowModal(false);
                }}
                className={`px-4 py-2 rounded-lg text-white transition ${
                  selectedUser.status === "active"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {selectedUser.status === "active" ? "Deactivate" : "Activate"} User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
