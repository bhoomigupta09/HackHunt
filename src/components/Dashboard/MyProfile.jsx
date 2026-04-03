import React, { useEffect, useState } from "react";
import { apiClient } from "../../api/client";
import { Edit2, Mail, Phone, Save, Sparkles, UserRound, X } from "lucide-react";
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

      if (!profileData.firstName || !profileData.lastName || !profileData.email) {
        setError("First name, last name, and email are required");
        setLoading(false);
        return;
      }

      await apiClient.updateProfile(userId, userRole, profileData);

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
    return <div className="py-16 text-center text-slate-500 dark:text-slate-400">Loading profile...</div>;
  }

  const inputClassName =
    "mt-2 w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 outline-none transition duration-200 placeholder:text-slate-400 focus:border-violet-300 focus:ring-4 focus:ring-violet-500/10 disabled:cursor-not-allowed disabled:bg-slate-100/90 disabled:text-slate-500 dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-violet-400 dark:disabled:bg-slate-800/50 dark:disabled:text-slate-500";

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {error && (
        <div className="rounded-[24px] border border-red-200 bg-red-50/90 px-5 py-4 text-sm font-medium text-red-700 shadow-sm dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-[24px] border border-emerald-200 bg-emerald-50/90 px-5 py-4 text-sm font-medium text-emerald-700 shadow-sm dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
          {success}
        </div>
      )}

      <section className="overflow-hidden rounded-[32px] border border-white/70 bg-[radial-gradient(circle_at_top_right,rgba(167,139,250,0.22),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.92),rgba(248,250,252,0.88))] shadow-[0_24px_80px_rgba(15,23,42,0.08)] transition-colors duration-300 dark:border-white/10 dark:bg-[radial-gradient(circle_at_top_right,rgba(167,139,250,0.16),transparent_30%),linear-gradient(135deg,rgba(30,41,59,0.96),rgba(15,23,42,0.9))] dark:shadow-[0_24px_80px_rgba(2,6,23,0.45)]">
        <div className="grid gap-0 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="p-6 sm:p-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
              <Sparkles size={14} />
              Profile hub
            </div>
            <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-5">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-500 via-fuchsia-500 to-sky-400 blur-md opacity-90" />
                  <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-slate-950/85 text-3xl font-semibold text-white ring-4 ring-white/80">
                    {profileData.firstName?.charAt(0) || "U"}
                  </div>
                </div>
                <div>
                  <h3 className="text-3xl font-semibold tracking-[-0.04em] text-slate-950 dark:text-slate-50">
                    {profileData.firstName || "Your"} {profileData.lastName || "Profile"}
                  </h3>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{profileData.email || "No email available"}</p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-xs font-medium text-slate-600 dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-300">
                      <Mail size={14} />
                      Verified email
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-700 dark:border-violet-500/20 dark:bg-violet-500/15 dark:text-violet-300">
                      <UserRound size={14} />
                      HackHunt user
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition duration-300 ${
                  isEditing
                    ? "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                    : "bg-gradient-to-r from-violet-600 via-fuchsia-500 to-indigo-600 text-white shadow-[0_18px_35px_rgba(139,92,246,0.28)] hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(139,92,246,0.34)]"
                }`}
              >
                {isEditing ? (
                  <>
                    <X size={17} />
                    Cancel editing
                  </>
                ) : (
                  <>
                    <Edit2 size={17} />
                    Edit profile
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="border-t border-white/60 bg-slate-950/[0.03] p-6 sm:p-8 dark:border-white/10 dark:bg-white/[0.03] xl:border-l xl:border-t-0">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">At a glance</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
              <div className="rounded-[24px] border border-white/80 bg-white/80 p-5 shadow-sm dark:border-white/10 dark:bg-slate-800/80">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Phone</p>
                <p className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                  <Phone size={15} className="text-violet-500" />
                  {profileData.phoneNumber || "Not added yet"}
                </p>
              </div>
              <div className="rounded-[24px] border border-white/80 bg-white/80 p-5 shadow-sm dark:border-white/10 dark:bg-slate-800/80">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Skills</p>
                <p className="mt-3 text-2xl font-semibold text-slate-950 dark:text-slate-50">{profileData.skills.length}</p>
              </div>
              <div className="rounded-[24px] border border-white/80 bg-white/80 p-5 shadow-sm dark:border-white/10 dark:bg-slate-800/80">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Status</p>
                <p className="mt-3 text-sm font-semibold text-emerald-600">{isEditing ? "Editing enabled" : "Profile synced"}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <div className="space-y-6">
          <div className="rounded-[30px] border border-white/70 bg-white/80 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-900/70 dark:shadow-[0_24px_80px_rgba(2,6,23,0.45)]">
            <div className="mb-6">
              <h4 className="text-xl font-semibold text-slate-950 dark:text-slate-50">Personal information</h4>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Keep your HackHunt profile polished and ready for team invites.</p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={profileData.firstName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={inputClassName}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={profileData.lastName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={inputClassName}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Email</label>
                <input type="email" name="email" value={profileData.email} disabled className={inputClassName} />
                <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">Email cannot be changed</p>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Phone Number</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={profileData.phoneNumber}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={inputClassName}
                />
              </div>
            </div>
          </div>

          <div className="rounded-[30px] border border-white/70 bg-white/80 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-900/70 dark:shadow-[0_24px_80px_rgba(2,6,23,0.45)]">
            <div className="mb-6">
              <h4 className="text-xl font-semibold text-slate-950 dark:text-slate-50">About you</h4>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Share a short intro to help organizers and teammates know your strengths.</p>
            </div>

            <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Bio</label>
            <textarea
              name="bio"
              value={profileData.bio}
              onChange={handleInputChange}
              disabled={!isEditing}
              rows="6"
              placeholder="Tell us about yourself..."
              className={`${inputClassName} resize-none`}
            />
            <div className="mt-3 text-xs text-slate-400 dark:text-slate-500">Maximum 500 characters. Current: {profileData.bio.length}</div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[30px] border border-white/70 bg-white/80 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-900/70 dark:shadow-[0_24px_80px_rgba(2,6,23,0.45)]">
            <div className="mb-6">
              <h4 className="text-xl font-semibold text-slate-950 dark:text-slate-50">Skills</h4>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Highlight your stack, specialties, and competition strengths.</p>
            </div>

            {isEditing && (
              <div className="mb-5 flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addSkill()}
                  placeholder="Enter a skill and press Enter"
                  className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition duration-200 focus:border-violet-300 focus:ring-4 focus:ring-violet-500/10 dark:border-white/10 dark:bg-slate-800 dark:text-slate-100"
                />
                <button
                  onClick={addSkill}
                  className="rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition duration-300 hover:-translate-y-0.5 hover:shadow-violet-500/30"
                >
                  Add skill
                </button>
              </div>
            )}

            <div className="flex min-h-[96px] flex-wrap gap-3">
              {profileData.skills.map((skill) => (
                <div
                  key={skill}
                  className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-medium text-violet-700 shadow-sm dark:border-violet-500/20 dark:bg-violet-500/15 dark:text-violet-300"
                >
                  <span>{skill}</span>
                  {isEditing && (
                    <button onClick={() => removeSkill(skill)} className="text-violet-500 transition hover:text-violet-700">
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
              {profileData.skills.length === 0 && (
                <div className="flex w-full items-center justify-center rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-sm text-slate-500 dark:border-white/10 dark:bg-slate-800/60 dark:text-slate-400">
                  {isEditing ? "No skills added yet. Add one to get started!" : "No skills added"}
                </div>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="rounded-[30px] border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-6 shadow-[0_24px_80px_rgba(16,185,129,0.08)] dark:border-emerald-500/20 dark:bg-gradient-to-br dark:from-emerald-500/10 dark:to-slate-900 dark:shadow-[0_24px_80px_rgba(2,6,23,0.45)]">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h4 className="text-lg font-semibold text-slate-950 dark:text-slate-50">Ready to save?</h4>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Your profile changes will sync to your HackHunt account.</p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition duration-300 hover:-translate-y-0.5 hover:shadow-emerald-500/35 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Save size={17} />
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default MyProfile;
