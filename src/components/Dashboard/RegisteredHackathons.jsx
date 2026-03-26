import React, { useEffect, useMemo, useState } from "react";
import { AlertCircle, Calendar, ExternalLink, Trash2 } from "lucide-react";
import { apiClient } from "../../api/client";
import { useRealtimeStream } from "../../hooks/useRealtimeStream";

const RegisteredHackathons = () => {
  const [registeredHackathons, setRegisteredHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const userId = localStorage.getItem("userId");

  const fetchRegisteredHackathons = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await apiClient.getUserRegistrations(userId);
      setRegisteredHackathons(response.registrations || []);
    } catch (err) {
      setError(err.message || "Failed to load registrations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchRegisteredHackathons();
    }
  }, [userId]);

  useRealtimeStream({
    "registration:created": (payload) => {
      if (payload?.userId === userId) {
        fetchRegisteredHackathons();
      }
    },
    "registration:deleted": (payload) => {
      if (payload?.userId === userId) {
        fetchRegisteredHackathons();
      }
    },
    "hackathon:approval-updated": fetchRegisteredHackathons,
    "hackathon:updated": fetchRegisteredHackathons,
    "hackathon:deleted": fetchRegisteredHackathons
  });

  const stats = useMemo(
    () => ({
      total: registeredHackathons.length,
      active: registeredHackathons.filter((r) => r.status === "in_progress").length,
      upcoming: registeredHackathons.filter((r) => r.status === "registered").length
    }),
    [registeredHackathons]
  );

  const handleUnregister = async (registrationId) => {
    if (!window.confirm("Are you sure you want to unregister from this hackathon?")) {
      return;
    }

    try {
      await apiClient.unregisterFromHackathon(registrationId);
      setSuccess("Successfully unregistered from hackathon.");
      setTimeout(() => setSuccess(""), 3000);
      await fetchRegisteredHackathons();
    } catch (err) {
      setError(err.message || "Failed to unregister");
    }
  };

  if (loading) {
    return <div className="py-16 text-center text-slate-500">Loading registrations...</div>;
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 flex items-center gap-2">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700">
          {success}
        </div>
      )}

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-[26px] border border-blue-200 bg-blue-50 px-5 py-5 shadow-sm">
          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">Total</div>
          <div className="mt-3 text-4xl font-bold text-slate-950">{stats.total}</div>
        </div>
        <div className="rounded-[26px] border border-violet-200 bg-violet-50 px-5 py-5 shadow-sm">
          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-700">Active</div>
          <div className="mt-3 text-4xl font-bold text-slate-950">{stats.active}</div>
        </div>
        <div className="rounded-[26px] border border-emerald-200 bg-emerald-50 px-5 py-5 shadow-sm">
          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Upcoming</div>
          <div className="mt-3 text-4xl font-bold text-slate-950">{stats.upcoming}</div>
        </div>
      </section>

      {registeredHackathons.length > 0 ? (
        <div className="space-y-5">
          {registeredHackathons.map((registration, index) => (
            <article
              key={registration._id}
              className="overflow-hidden rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-1"
              style={{ animation: `feature-fade-up 0.55s ease-out ${index * 0.06}s both` }}
            >
              <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-2xl font-bold text-slate-950">{registration.hackathonName}</h3>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        registration.status === "in_progress"
                          ? "bg-red-100 text-red-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {registration.status === "in_progress" ? "In Progress" : "Upcoming"}
                    </span>
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Registered On</p>
                      <p className="mt-1 text-base font-semibold text-slate-900">
                        {new Date(registration.registrationDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Location</p>
                      <p className="mt-1 text-base font-semibold text-slate-900">{registration.location}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Hackathon Dates</p>
                      <p className="mt-1 text-base font-semibold text-slate-900">
                        {new Date(registration.startDate).toLocaleDateString()} -{" "}
                        {new Date(registration.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Team Info</p>
                      <p className="mt-1 text-base font-semibold text-slate-900">
                        {registration.teamName} ({registration.teamMembers} member
                        {registration.teamMembers !== 1 ? "s" : ""})
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 rounded-2xl bg-slate-50 px-4 py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Calendar size={16} />
                      Registration ID
                    </div>
                    <code className="mt-2 inline-block rounded-xl bg-white px-3 py-2 text-sm text-slate-700">
                      {registration._id}
                    </code>
                  </div>
                </div>

                <div className="flex flex-col gap-3 xl:w-52">
                  <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700">
                    <ExternalLink size={16} />
                    View Details
                  </button>
                  <button
                    onClick={() => handleUnregister(registration._id)}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                  >
                    <Trash2 size={16} />
                    Unregister
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-[28px] border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <p className="text-lg font-semibold text-slate-800">No registrations yet</p>
          <p className="mt-2 text-sm text-slate-500">
            Browse approved hackathons and register to see them here instantly.
          </p>
        </div>
      )}
    </div>
  );
};

export default RegisteredHackathons;
