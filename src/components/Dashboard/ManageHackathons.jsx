import React, { useEffect, useMemo, useState } from "react";
import { Calendar, Edit2, MapPin, Plus, Sparkles, Trash2, Trophy, Users } from "lucide-react";
import { apiClient } from "../../api/client";
import { useRealtimeStream } from "../../hooks/useRealtimeStream";
import LocationMapInput from "../LocationMapInput";

const initialFormData = {
  title: "",
  description: "",
  startDate: "",
  endDate: "",
  location: "",
  address: "",
  latitude: 51.505,
  longitude: -0.09,
  mode: "online",
  maxParticipants: 100,
  prize: "",
  imageUrl: "",
  registrationUrl: "",
  tags: ""
};

const approvalTone = {
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  approved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  rejected: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300"
};

const todayDate = () => new Date().toISOString().slice(0, 10);

const ManageHackathons = ({ user }) => {
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingHackathon, setEditingHackathon] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  const [submitting, setSubmitting] = useState(false);

  const organizerId = localStorage.getItem("userId");

  const fetchHackathons = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await apiClient.getOrganizerHackathons(organizerId);
      setHackathons(response.hackathons || []);
    } catch (err) {
      setError(err.message || "Failed to load organizer hackathons.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (organizerId) {
      fetchHackathons();
    }
  }, [organizerId]);

  useRealtimeStream({
    "hackathon:created": fetchHackathons,
    "hackathon:updated": fetchHackathons,
    "hackathon:deleted": fetchHackathons,
    "hackathon:approval-updated": fetchHackathons,
    "registration:created": fetchHackathons,
    "registration:deleted": fetchHackathons
  });

  const stats = useMemo(
    () => ({
      total: hackathons.length,
      pending: hackathons.filter((item) => item.approvalStatus === "pending").length,
      approved: hackathons.filter((item) => item.approvalStatus === "approved").length
    }),
    [hackathons]
  );

  const handleOpenForm = (hackathon = null) => {
    setEditingHackathon(hackathon);
    setFormData(
      hackathon
        ? {
            title: hackathon.title || "",
            description: hackathon.description || "",
            startDate: hackathon.startDate?.slice(0, 10) || "",
            endDate: hackathon.endDate?.slice(0, 10) || "",
            location: hackathon.location || "",
            address: hackathon.address || "",
            latitude: hackathon.latitude || 51.505,
            longitude: hackathon.longitude || -0.09,
            mode: hackathon.mode || "online",
            maxParticipants: hackathon.maxParticipants || 100,
            prize: hackathon.prize || "",
            imageUrl: hackathon.imageUrl || "",
            registrationUrl: hackathon.registrationUrl || "",
            tags: (hackathon.tags || []).join(", ")
          }
        : initialFormData
    );
    setShowModal(true);
  };

  const handleLocationChange = (locationData) => {
    setFormData((prev) => ({
      ...prev,
      location: locationData.address ?? prev.location,
      address: locationData.address ?? prev.address,
      latitude: locationData.latitude ?? prev.latitude,
      longitude: locationData.longitude ?? prev.longitude
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitForm = async () => {
    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      if (!formData.title || !formData.description || !formData.startDate || !formData.endDate || !formData.location) {
        setError("Please fill in all required fields before submitting.");
        setSubmitting(false);
        return;
      }

      if (formData.startDate < todayDate()) {
        setError("Start date must be today or later so users can see a valid upcoming event.");
        setSubmitting(false);
        return;
      }

      if (formData.endDate < formData.startDate) {
        setError("End date must be the same as or after the start date.");
        setSubmitting(false);
        return;
      }

      const payload = {
        ...formData,
        organizerId,
        maxParticipants: Number(formData.maxParticipants) || 100
      };

      if (editingHackathon) {
        await apiClient.updateHackathon(editingHackathon._id, payload);
        setSuccess("Hackathon updated and resubmitted for approval.");
      } else {
        await apiClient.createHackathon(payload);
        setSuccess("Hackathon created and sent for admin approval.");
      }

      setShowModal(false);
      setFormData(initialFormData);
      setEditingHackathon(null);
      setTimeout(() => setSuccess(""), 3000);
      await fetchHackathons();
    } catch (err) {
      setError(err.message || "Failed to save hackathon.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteHackathon = async (id) => {
    if (!window.confirm("Delete this hackathon from the platform?")) {
      return;
    }

    try {
      await apiClient.deleteHackathon(id, organizerId);
      setSuccess("Hackathon deleted successfully.");
      setTimeout(() => setSuccess(""), 3000);
      await fetchHackathons();
    } catch (err) {
      setError(err.message || "Failed to delete hackathon.");
    }
  };

  if (loading) {
    return <div className="py-16 text-center text-slate-500 dark:text-slate-400">Loading your hackathons...</div>;
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="rounded-[24px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 shadow-sm dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
          {success}
        </div>
      )}

      <section className="rounded-[30px] border border-amber-100 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.18),transparent_24%),linear-gradient(135deg,#fff7ed,#ffffff)] p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.14),transparent_24%),linear-gradient(135deg,rgba(30,41,59,0.96),rgba(15,23,42,0.9))] dark:shadow-[0_24px_80px_rgba(2,6,23,0.45)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
              Organizer Studio
            </div>
            <h3 className="mt-4 text-3xl font-bold tracking-[-0.04em] text-slate-950 dark:text-slate-50">
              Build a real hackathon pipeline
            </h3>
            <p className="mt-3 text-base leading-7 text-slate-600 dark:text-slate-300">
              Create events, update schedules, and track approvals. Approved hackathons go live for users automatically.
            </p>
          </div>

          <button
            onClick={() => handleOpenForm()}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:shadow-orange-900/20"
          >
            <Plus size={18} />
            New Hackathon
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-[24px] border border-white/80 bg-white/80 px-4 py-4 shadow-sm dark:border-white/10 dark:bg-slate-800/80">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-500">Total</div>
            <div className="mt-2 text-4xl font-bold text-slate-950 dark:text-slate-50">{stats.total}</div>
          </div>
          <div className="rounded-[24px] border border-amber-200 bg-amber-50 px-4 py-4 shadow-sm dark:border-amber-500/20 dark:bg-amber-500/10">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-600">Pending</div>
            <div className="mt-2 text-4xl font-bold text-slate-950 dark:text-slate-50">{stats.pending}</div>
          </div>
          <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 px-4 py-4 shadow-sm dark:border-emerald-500/20 dark:bg-emerald-500/10">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">Approved</div>
            <div className="mt-2 text-4xl font-bold text-slate-950 dark:text-slate-50">{stats.approved}</div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-5">
        {hackathons.length > 0 ? (
          hackathons.map((hackathon, index) => (
            <article
              key={hackathon._id}
              className="overflow-hidden rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_70px_rgba(251,146,60,0.12)] dark:border-white/10 dark:bg-slate-900/75 dark:shadow-[0_18px_60px_rgba(2,6,23,0.45)]"
              style={{ animation: `feature-fade-up 0.55s ease-out ${index * 0.05}s both` }}
            >
              <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h4 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-slate-50">{hackathon.title}</h4>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${approvalTone[hackathon.approvalStatus] || "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"}`}>
                      {hackathon.approvalStatus}
                    </span>
                    {hackathon.approvalStatus === "pending" && (
                      <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                        Waiting for admin approval
                      </span>
                    )}
                  </div>

                  <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300">{hackathon.description}</p>

                  <div className="mt-6 grid gap-4 md:grid-cols-4">
                    <div className="rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-800/70">
                      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <Calendar size={16} />
                        Start
                      </div>
                      <p className="mt-2 font-semibold text-slate-900 dark:text-slate-100">
                        {new Date(hackathon.startDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-800/70">
                      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <MapPin size={16} />
                        Location
                      </div>
                      <p className="mt-2 font-semibold text-slate-900 dark:text-slate-100">{hackathon.location}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-800/70">
                      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <Users size={16} />
                        Participants
                      </div>
                      <p className="mt-2 font-semibold text-slate-900 dark:text-slate-100">
                        {hackathon.participants}/{hackathon.maxParticipants}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-800/70">
                      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <Trophy size={16} />
                        Prize
                      </div>
                      <p className="mt-2 font-semibold text-slate-900 dark:text-slate-100">{hackathon.prize || "TBA"}</p>
                    </div>
                  </div>

                  {hackathon.rejectionReason && (
                    <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
                      Rejection note: {hackathon.rejectionReason}
                    </div>
                  )}
                </div>

                <div className="flex gap-3 xl:w-44 xl:flex-col">
                  <button
                    onClick={() => handleOpenForm(hackathon)}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700 transition-all duration-300 hover:bg-amber-100 dark:bg-amber-500/10 dark:text-amber-300 dark:hover:bg-amber-500/15"
                  >
                    <Edit2 size={16} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteHackathon(hackathon._id)}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 transition-all duration-300 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-500/15"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-[28px] border border-dashed border-slate-300 bg-white px-6 py-16 text-center text-slate-500 dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-400">
            <Sparkles className="mx-auto mb-4 h-10 w-10 text-slate-300 dark:text-slate-600" />
            No hackathons yet. Create your first event and send it for admin approval.
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[30px] border border-white/40 bg-white shadow-2xl dark:border-white/10 dark:bg-slate-900">
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5 dark:border-white/10 dark:bg-slate-900">
              <div>
                <h3 className="text-2xl font-bold text-slate-950 dark:text-slate-50">
                  {editingHackathon ? "Edit Hackathon" : "Create Hackathon"}
                </h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Changes are synced live after admin approval.
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-full bg-slate-100 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Close
              </button>
            </div>

            <div className="grid gap-5 px-6 py-6 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Title</label>
                <input type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="Hackathon title" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-amber-300 focus:bg-white dark:border-white/10 dark:bg-slate-800 dark:text-slate-100 dark:focus:bg-slate-800" />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} rows="4" placeholder="Describe your hackathon clearly" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-amber-300 focus:bg-white dark:border-white/10 dark:bg-slate-800 dark:text-slate-100 dark:focus:bg-slate-800" />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Start Date</label>
                <input type="date" min={todayDate()} name="startDate" value={formData.startDate} onChange={handleInputChange} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-slate-800 dark:text-slate-100" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">End Date</label>
                <input type="date" min={formData.startDate || todayDate()} name="endDate" value={formData.endDate} onChange={handleInputChange} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-slate-800 dark:text-slate-100" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Mode</label>
                <select name="mode" value={formData.mode} onChange={handleInputChange} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-slate-800 dark:text-slate-100">
                  <option value="online">Online</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="in-person">In-person</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Max Participants</label>
                <input type="number" name="maxParticipants" value={formData.maxParticipants} onChange={handleInputChange} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-slate-800 dark:text-slate-100" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Prize Pool</label>
                <input type="text" name="prize" value={formData.prize} onChange={handleInputChange} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-slate-800 dark:text-slate-100" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Image URL</label>
                <input type="text" name="imageUrl" value={formData.imageUrl} onChange={handleInputChange} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-slate-800 dark:text-slate-100" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Registration URL</label>
                <input type="text" name="registrationUrl" value={formData.registrationUrl} onChange={handleInputChange} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-slate-800 dark:text-slate-100" />
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Tags</label>
                <input type="text" name="tags" value={formData.tags} onChange={handleInputChange} placeholder="AI, Web3, Open Source" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-slate-800 dark:text-slate-100" />
              </div>

              <div className="md:col-span-2">
                <LocationMapInput onLocationChange={handleLocationChange} />
              </div>
            </div>

            <div className="sticky bottom-0 flex justify-end gap-3 border-t border-slate-200 bg-white px-6 py-5 dark:border-white/10 dark:bg-slate-900">
              <button onClick={() => setShowModal(false)} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-slate-800">
                Cancel
              </button>
              <button onClick={handleSubmitForm} disabled={submitting} className="rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-3 text-sm font-semibold text-white transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70">
                {submitting ? "Saving..." : editingHackathon ? "Update Hackathon" : "Create Hackathon"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageHackathons;
