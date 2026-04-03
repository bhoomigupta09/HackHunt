import React, { useState, useEffect } from "react";
import { apiClient } from "../../api/client";
import { Building2, Edit2, Globe, Phone, Save, Sparkles, X } from "lucide-react";
import { useRealtimeStream } from "../../hooks/useRealtimeStream";

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
    fetchOrganizerProfile();
  }, [user]);

  useRealtimeStream({
    "profile:updated": (payload) => {
      const userId = localStorage.getItem("userId");
      if (payload?.userId === userId) {
        fetchOrganizerProfile();
        setSuccess("Profile refreshed with the latest live changes.");
        setTimeout(() => setSuccess(""), 3000);
      }
    }
  });

  const fetchOrganizerProfile = async () => {
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
          organizationName: response.organizationName || "",
          organizationWebsite: response.organizationWebsite || "",
          bio: response.bio || "",
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

      if (!profileData.firstName || !profileData.lastName || !profileData.email || !profileData.organizationName) {
        setError("Please fill in all required fields");
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

  const inputClassName =
    "mt-2 w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 outline-none transition duration-200 placeholder:text-slate-400 focus:border-amber-300 focus:ring-4 focus:ring-amber-500/10 disabled:cursor-not-allowed disabled:bg-slate-100/90 disabled:text-slate-500 dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-amber-400 dark:disabled:bg-slate-800/50 dark:disabled:text-slate-500";

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

      <section className="overflow-hidden rounded-[32px] border border-white/70 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.18),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.92),rgba(255,251,235,0.88))] shadow-[0_24px_80px_rgba(15,23,42,0.08)] transition-colors duration-300 dark:border-white/10 dark:bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.12),transparent_30%),linear-gradient(135deg,rgba(30,41,59,0.96),rgba(15,23,42,0.9))] dark:shadow-[0_24px_80px_rgba(2,6,23,0.45)]">
        <div className="grid gap-0 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="p-6 sm:p-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
              <Sparkles size={14} />
              Organizer profile
            </div>
            <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-5">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-400 via-orange-400 to-rose-400 blur-md opacity-90" />
                  <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-slate-950/85 text-3xl font-semibold text-white ring-4 ring-white/80">
                    {profileData.organizationName?.charAt(0) || profileData.firstName?.charAt(0) || "O"}
                  </div>
                </div>
                <div>
                  <h3 className="text-3xl font-semibold tracking-[-0.04em] text-slate-950 dark:text-slate-50">
                    {profileData.organizationName || "Organization Profile"}
                  </h3>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{profileData.email || "No email available"}</p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-xs font-medium text-slate-600 dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-300">
                      <Building2 size={14} />
                      Organizer
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/15 dark:text-amber-300">
                      <Globe size={14} />
                      Public-facing profile
                    </span>
                  </div>
                </div>
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
                className={`inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition duration-300 ${
                  isEditing
                    ? "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                    : "bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white shadow-[0_18px_35px_rgba(251,146,60,0.28)] hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(251,146,60,0.34)]"
                }`}
              >
                {isEditing ? (
                  <>
                    <Save size={17} />
                    Save changes
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
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Contact</p>
                <p className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                  <Phone size={15} className="text-amber-500" />
                  {profileData.phoneNumber || "Not added yet"}
                </p>
              </div>
              <div className="rounded-[24px] border border-white/80 bg-white/80 p-5 shadow-sm dark:border-white/10 dark:bg-slate-800/80">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Website</p>
                <p className="mt-3 truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {profileData.organizationWebsite || "Not added yet"}
                </p>
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
              <h4 className="text-xl font-semibold text-slate-950 dark:text-slate-50">Contact information</h4>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Keep your organizer identity polished and ready for public event listings.</p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300">First Name *</label>
                <input type="text" name="firstName" value={profileData.firstName} onChange={handleInputChange} disabled={!isEditing} className={inputClassName} />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Last Name *</label>
                <input type="text" name="lastName" value={profileData.lastName} onChange={handleInputChange} disabled={!isEditing} className={inputClassName} />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Email *</label>
                <input type="email" name="email" value={profileData.email} onChange={handleInputChange} disabled={!isEditing} className={inputClassName} />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Phone Number</label>
                <input type="tel" name="phoneNumber" value={profileData.phoneNumber} onChange={handleInputChange} disabled={!isEditing} className={inputClassName} />
              </div>
            </div>
          </div>

          <div className="rounded-[30px] border border-white/70 bg-white/80 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-900/70 dark:shadow-[0_24px_80px_rgba(2,6,23,0.45)]">
            <div className="mb-6">
              <h4 className="text-xl font-semibold text-slate-950 dark:text-slate-50">Organization details</h4>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">These details shape how your hackathons appear to participants and admins.</p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Organization Name *</label>
                <input type="text" name="organizationName" value={profileData.organizationName} onChange={handleInputChange} disabled={!isEditing} className={inputClassName} />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Organization Website</label>
                <input type="url" name="organizationWebsite" value={profileData.organizationWebsite} onChange={handleInputChange} disabled={!isEditing} placeholder="https://example.com" className={inputClassName} />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Bio / About Organization</label>
                <textarea name="bio" value={profileData.bio} onChange={handleInputChange} disabled={!isEditing} rows="5" className={`${inputClassName} resize-none`} />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[30px] border border-white/70 bg-white/80 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-900/70 dark:shadow-[0_24px_80px_rgba(2,6,23,0.45)]">
            <div className="mb-6">
              <h4 className="text-xl font-semibold text-slate-950 dark:text-slate-50">Participants overview</h4>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">A quick snapshot of your organizer footprint on the platform.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
              <div className="rounded-[24px] border border-amber-200 bg-amber-50 px-5 py-5 shadow-sm dark:border-amber-500/20 dark:bg-amber-500/10">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">Hackathons Created</div>
                <div className="mt-3 text-4xl font-bold text-slate-950 dark:text-slate-50">5</div>
              </div>
              <div className="rounded-[24px] border border-blue-200 bg-blue-50 px-5 py-5 shadow-sm dark:border-blue-500/20 dark:bg-blue-500/10">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">Total Participants</div>
                <div className="mt-3 text-4xl font-bold text-slate-950 dark:text-slate-50">23</div>
              </div>
              <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 px-5 py-5 shadow-sm dark:border-emerald-500/20 dark:bg-emerald-500/10">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Active Hackathons</div>
                <div className="mt-3 text-4xl font-bold text-slate-950 dark:text-slate-50">3</div>
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="rounded-[30px] border border-amber-100 bg-gradient-to-br from-amber-50 to-white p-6 shadow-[0_24px_80px_rgba(251,146,60,0.08)] dark:border-amber-500/20 dark:bg-gradient-to-br dark:from-amber-500/10 dark:to-slate-900 dark:shadow-[0_24px_80px_rgba(2,6,23,0.45)]">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h4 className="text-lg font-semibold text-slate-950 dark:text-slate-50">Ready to update?</h4>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Your organizer profile changes will sync to the platform instantly.</p>
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
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 transition duration-300 hover:-translate-y-0.5 hover:shadow-amber-500/35 disabled:cursor-not-allowed disabled:opacity-60"
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

export default OrganizerProfile;
