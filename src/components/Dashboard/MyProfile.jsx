import React, { useState, useEffect } from "react";
import { apiClient } from "../../api/client";
import { Edit2, Save, X } from "lucide-react";
import { useRealtimeStream } from "../../hooks/useRealtimeStream";

const MyProfile = ({ user }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    bio: "",
    skills: [],
    profilePicture: ""
  });
  const [skillInput, setSkillInput] = useState("");

  useEffect(() => {
    // Fetch user profile data from backend
    fetchUserProfile();
  }, [user]);

  useRealtimeStream({
    "profile:updated": (payload) => {
      const userId = localStorage.getItem("userId");
      if (payload?.userId === userId) {
        fetchUserProfile();
        setSuccess("Profile refreshed with the latest live changes.");
        setTimeout(() => setSuccess(""), 3000);
      }
    }
  });

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem("userId");
      const userRole = localStorage.getItem("userRole");

      if (!userId || !userRole) {
        throw new Error("User not authenticated");
      }

      const response = await apiClient.fetchProfile(userId, userRole);
      
      if (response) {
  setProfileData({
    firstName: response.firstName || "",
    lastName: response.lastName || "",
    email: response.email || "",
    phoneNumber: response.phoneNumber || "",
    bio: response.bio || "",
    skills: response.skills || [],
    profilePicture: response.profilePicture || ""
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
        bio: "",
        skills: [],
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

  const addSkill = () => {
    if (skillInput.trim() && !profileData.skills.includes(skillInput.trim())) {
      setProfileData((prev) => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput("");
    }
  };

  const removeSkill = (skillToRemove) => {
    setProfileData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove)
    }));
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
        setError("First name, last name, and email are required");
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

  if (loading && !profileData.firstName) {
    return <div className="text-center py-10">Loading profile...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
          {success}
        </div>
      )}

      {/* Profile Header */}
      <div className="flex items-center justify-between mb-8 pb-6 border-b">
        <div className="flex items-center space-x-6">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
            {profileData.firstName?.charAt(0)}
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800">
              {profileData.firstName} {profileData.lastName}
            </h3>
            <p className="text-gray-600">{profileData.email}</p>
          </div>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition duration-200 ${
            isEditing
              ? "bg-gray-500 text-white hover:bg-gray-600"
              : "bg-purple-600 text-white hover:bg-purple-700"
          }`}
        >
          {isEditing ? (
            <>
              <X size={18} />
              <span>Cancel</span>
            </>
          ) : (
            <>
              <Edit2 size={18} />
              <span>Edit Profile</span>
            </>
          )}
        </button>
      </div>

      {/* Profile Form */}
      <div className="space-y-6">
        {/* Personal Information */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">
            Personal Information
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={profileData.firstName}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full mt-1 px-4 py-2 border rounded-lg disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={profileData.lastName}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full mt-1 px-4 py-2 border rounded-lg disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={profileData.email}
                disabled
                className="w-full mt-1 px-4 py-2 border rounded-lg bg-gray-100 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={profileData.phoneNumber}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full mt-1 px-4 py-2 border rounded-lg disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">About You</h4>

          <div>
            <label className="text-sm font-medium text-gray-700">Bio</label>
            <textarea
              name="bio"
              value={profileData.bio}
              onChange={handleInputChange}
              disabled={!isEditing}
              rows="4"
              placeholder="Tell us about yourself..."
              className="w-full mt-1 px-4 py-2 border rounded-lg disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">
              Maximum 500 characters. Current: {profileData.bio.length}
            </p>
          </div>
        </div>

        {/* Skills */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Skills</h4>

          <div className="space-y-4">
            {isEditing && (
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addSkill()}
                  placeholder="Enter a skill and press Enter"
                  className="flex-1 px-4 py-2 border rounded-lg"
                />
                <button
                  onClick={addSkill}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Add
                </button>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {profileData.skills.map((skill) => (
                <div
                  key={skill}
                  className="flex items-center space-x-2 bg-purple-100 text-purple-800 px-3 py-1 rounded-full"
                >
                  <span className="text-sm font-medium">{skill}</span>
                  {isEditing && (
                    <button
                      onClick={() => removeSkill(skill)}
                      className="ml-1 hover:text-purple-600"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
            {profileData.skills.length === 0 && (
              <p className="text-gray-500 text-sm">
                {isEditing ? "No skills added yet. Add one to get started!" : "No skills added"}
              </p>
            )}
          </div>
        </div>

        {/* Save Button */}
        {isEditing && (
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => setIsEditing(false)}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveProfile}
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center space-x-2"
            >
              <Save size={18} />
              <span>{loading ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyProfile;
