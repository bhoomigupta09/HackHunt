import React, { useState, useEffect } from "react";
import { apiClient } from "../../api/client";
import { Edit2, Save, X } from "lucide-react";

const OrganizerProfile = ({ user }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    organizationName: "",
    organizationWebsite: "",
    bio: "",
    profilePicture: ""
  });

  useEffect(() => {
    // Fetch organizer profile data from backend
    fetchOrganizerProfile();
  }, [user]);

  const fetchOrganizerProfile = async () => {
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
          organizationName: response.profile.organizationName || "",
          organizationWebsite: response.profile.organizationWebsite || "",
          bio: response.profile.bio || "",
          profilePicture: response.profile.profilePicture || ""
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
        organizationName: "",
        organizationWebsite: "",
        bio: "",
        profilePicture: ""
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
      if (!profileData.firstName || !profileData.lastName || !profileData.email || !profileData.organizationName) {
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
      {/* Profile Header */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-2xl font-bold text-gray-800">Organization Profile</h3>
          <p className="text-gray-600 mt-1">Manage your organization information</p>
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
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg hover:from-amber-600 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-400 transition duration-200"
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
            className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
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
            className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
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
            className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
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
            className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
              !isEditing ? "bg-gray-50 cursor-not-allowed" : "bg-white"
            }`}
          />
        </div>

        {/* Organization Name */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Organization Name *
          </label>
          <input
            type="text"
            name="organizationName"
            value={profileData.organizationName}
            onChange={handleInputChange}
            disabled={!isEditing}
            className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
              !isEditing ? "bg-gray-50 cursor-not-allowed" : "bg-white"
            }`}
          />
        </div>

        {/* Organization Website */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Organization Website
          </label>
          <input
            type="url"
            name="organizationWebsite"
            value={profileData.organizationWebsite}
            onChange={handleInputChange}
            disabled={!isEditing}
            placeholder="https://example.com"
            className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
              !isEditing ? "bg-gray-50 cursor-not-allowed" : "bg-white"
            }`}
          />
        </div>

        {/* Bio */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bio / About Organization
          </label>
          <textarea
            name="bio"
            value={profileData.bio}
            onChange={handleInputChange}
            disabled={!isEditing}
            rows="4"
            className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
              !isEditing ? "bg-gray-50 cursor-not-allowed" : "bg-white"
            }`}
          />
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 pt-8 border-t border-gray-200">
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-lg">
          <div className="text-3xl font-bold text-orange-600">5</div>
          <p className="text-gray-600 mt-2">Hackathons Created</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg">
          <div className="text-3xl font-bold text-blue-600">23</div>
          <p className="text-gray-600 mt-2">Total Participants</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg">
          <div className="text-3xl font-bold text-green-600">3</div>
          <p className="text-gray-600 mt-2">Active Hackathons</p>
        </div>
      </div>
    </div>
  );
};

export default OrganizerProfile;
