import React, { useState, useEffect } from "react";
import { apiClient } from "../../api/client";
import { Edit2, Save, X, AlertCircle } from "lucide-react";

const AdminProfile = ({ user }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    adminLevel: "moderator",
    department: ""
  });

  useEffect(() => {
    // Fetch admin profile data from backend
    fetchAdminProfile();
  }, [user]);

  const fetchAdminProfile = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem("userId");
      const userRole = localStorage.getItem("userRole");

      if (!userId || !userRole) {
        throw new Error("User not authenticated");
      }

      const response = await apiClient.fetchProfile(userId, userRole);
      
      if (response.profile) {
        setProfileData({
          firstName: response.profile.firstName || "",
          lastName: response.profile.lastName || "",
          email: response.profile.email || "",
          phoneNumber: response.profile.phoneNumber || "",
          adminLevel: response.profile.adminLevel || "moderator",
          department: response.profile.department || ""
        });
      }
    } catch (err) {
      console.error("Profile fetch error:", err);
      // Fall back to localStorage data if API fails
      setProfileData({
        firstName: localStorage.getItem("userName") || "",
        lastName: "",
        email: localStorage.getItem("userEmail") || "",
        phoneNumber: "",
        adminLevel: "moderator",
        department: ""
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const userId = localStorage.getItem("userId");
      const userRole = localStorage.getItem("userRole");

      if (!userId || !userRole) {
        throw new Error("User not authenticated");
      }

      // Validate required fields
      if (!profileData.firstName || !profileData.lastName || !profileData.email) {
        setError("Please fill in all required fields");
        setLoading(false);
        return;
      }

      // Call API to update profile
      const response = await apiClient.updateProfile(userId, userRole, profileData);

      setSuccess("Profile updated successfully!");
      setIsEditing(false);

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Update profile error:", err);
      setError(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Security Warning */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg flex items-start space-x-3">
        <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
        <div>
          <h3 className="font-medium text-yellow-800">Admin Access</h3>
          <p className="text-sm text-yellow-700 mt-1">
            You have elevated privileges on this platform. Handle sensitive data responsibly.
          </p>
        </div>
      </div>

      {/* Profile Header */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-2xl font-bold text-gray-800">Administrator Profile</h3>
          <p className="text-gray-600 mt-1">Manage your administrator account information</p>
        </div>
        <button
          onClick={() => {
            if (isEditing) {
              handleSaveProfile();
            } else {
              setIsEditing(true);
            }
          }}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg hover:from-red-600 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-400 transition duration-200"
        >
          {isEditing ? (
            <>
              <Save size={18} />
              <span>Save Changes</span>
            </>
          ) : (
            <>
              <Edit2 size={18} />
              <span>Edit Profile</span>
            </>
          )}
        </button>
      </div>

      {/* Error and Success Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
          {error}
          <button onClick={() => setError("")}>
            <X size={18} />
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center justify-between">
          {success}
          <button onClick={() => setSuccess("")}>
            <X size={18} />
          </button>
        </div>
      )}

      {/* Profile Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* First Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            First Name *
          </label>
          <input
            type="text"
            name="firstName"
            value={profileData.firstName}
            onChange={handleInputChange}
            disabled={!isEditing}
            className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
              !isEditing ? "bg-gray-50 cursor-not-allowed" : "bg-white"
            }`}
          />
        </div>

        {/* Last Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Last Name *
          </label>
          <input
            type="text"
            name="lastName"
            value={profileData.lastName}
            onChange={handleInputChange}
            disabled={!isEditing}
            className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
              !isEditing ? "bg-gray-50 cursor-not-allowed" : "bg-white"
            }`}
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email *
          </label>
          <input
            type="email"
            name="email"
            value={profileData.email}
            onChange={handleInputChange}
            disabled={!isEditing}
            className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
              !isEditing ? "bg-gray-50 cursor-not-allowed" : "bg-white"
            }`}
          />
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            name="phoneNumber"
            value={profileData.phoneNumber}
            onChange={handleInputChange}
            disabled={!isEditing}
            className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
              !isEditing ? "bg-gray-50 cursor-not-allowed" : "bg-white"
            }`}
          />
        </div>

        {/* Admin Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Admin Level
          </label>
          <select
            name="adminLevel"
            value={profileData.adminLevel}
            onChange={handleInputChange}
            disabled={!isEditing}
            className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
              !isEditing ? "bg-gray-50 cursor-not-allowed" : "bg-white"
            }`}
          >
            <option value="super_admin">Super Administrator</option>
            <option value="moderator">Moderator</option>
            <option value="support">Support Staff</option>
          </select>
        </div>

        {/* Department */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Department
          </label>
          <input
            type="text"
            name="department"
            value={profileData.department}
            onChange={handleInputChange}
            disabled={!isEditing}
            className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
              !isEditing ? "bg-gray-50 cursor-not-allowed" : "bg-white"
            }`}
          />
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-gray-200">
        <div className="bg-gradient-to-br from-red-50 to-pink-50 p-6 rounded-lg">
          <div className="text-3xl font-bold text-red-600">127</div>
          <p className="text-gray-600 mt-2 text-sm">Total Users</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg">
          <div className="text-3xl font-bold text-blue-600">34</div>
          <p className="text-gray-600 mt-2 text-sm">Active Organizers</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg">
          <div className="text-3xl font-bold text-green-600">12</div>
          <p className="text-gray-600 mt-2 text-sm">Active Hackathons</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-lg">
          <div className="text-3xl font-bold text-purple-600">98</div>
          <p className="text-gray-600 mt-2 text-sm">Total Registrations</p>
        </div>
      </div>

      {/* Permissions */}
      <div className="mt-8 pt-8 border-t border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Your Permissions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
            <div className="w-2 h-2 bg-green-600 rounded-full"></div>
            <span className="text-sm text-gray-700">Manage Users & Organizers</span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
            <div className="w-2 h-2 bg-green-600 rounded-full"></div>
            <span className="text-sm text-gray-700">Monitor Hackathons</span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
            <div className="w-2 h-2 bg-green-600 rounded-full"></div>
            <span className="text-sm text-gray-700">View Analytics & Reports</span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
            <div className="w-2 h-2 bg-green-600 rounded-full"></div>
            <span className="text-sm text-gray-700">System Configuration</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
