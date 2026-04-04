import React, { useEffect, useMemo, useState } from "react";
import { AlertCircle, Calendar, ExternalLink, MapPin, ShieldCheck, Users } from "lucide-react";
import { apiClient } from "../../api/client";
import { useRealtimeStream } from "../../hooks/useRealtimeStream";

const RegisteredHackathons = () => {
  const [registeredHackathons, setRegisteredHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  if (loading) {
    return <div className="py-16 text-center text-slate-500 dark:text-slate-400">Loading registrations...</div>;
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="flex items-center gap-2 rounded-[24px] border border-red-200 bg-red-50 px-4 py-3 text-red-700 shadow-sm dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <section className="overflow-hidden rounded-[32px] border border-white/70 bg-[radial-gradient(circle_at_top_right,rgba(167,139,250,0.18),transparent_26%),linear-gradient(135deg,rgba(255,255,255,0.92),rgba(248,250,252,0.84))] p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-[radial-gradient(circle_at_top_right,rgba(167,139,250,0.16),transparent_26%),linear-gradient(135deg,rgba(30,41,59,0.96),rgba(15,23,42,0.9))] dark:shadow-[0_24px_80px_rgba(2,6,23,0.45)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h3 className="text-3xl font-semibold tracking-[-0.04em] text-slate-950 dark:text-slate-50">Your registered hackathons</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-base">
              Keep track of your active challenges, upcoming events, and registration details in one clean workspace.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-[26px] border border-blue-200 bg-blue-50 px-5 py-5 shadow-sm dark:border-blue-500/20 dark:bg-blue-500/10">
              <div className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">Total</div>
              <div className="mt-3 text-4xl font-bold text-slate-950 dark:text-slate-50">{stats.total}</div>
            </div>
            <div className="rounded-[26px] border border-violet-200 bg-violet-50 px-5 py-5 shadow-sm dark:border-violet-500/20 dark:bg-violet-500/10">
              <div className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-700">Active</div>
              <div className="mt-3 text-4xl font-bold text-slate-950 dark:text-slate-50">{stats.active}</div>
            </div>
            <div className="rounded-[26px] border border-emerald-200 bg-emerald-50 px-5 py-5 shadow-sm dark:border-emerald-500/20 dark:bg-emerald-500/10">
              <div className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Upcoming</div>
              <div className="mt-3 text-4xl font-bold text-slate-950 dark:text-slate-50">{stats.upcoming}</div>
            </div>
          </div>
        </div>
      </section>

      {registeredHackathons.length > 0 ? (
        <div className="space-y-5">
          {registeredHackathons.map((registration, index) => (
            <article
              key={registration._id}
              className="overflow-hidden rounded-[32px] border border-white/70 bg-white/85 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_70px_rgba(139,92,246,0.12)] dark:border-white/10 dark:bg-slate-900/75 dark:shadow-[0_18px_60px_rgba(2,6,23,0.45)]"
              style={{ animation: `feature-fade-up 0.55s ease-out ${index * 0.06}s both` }}
            >
              <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-2xl font-bold text-slate-950 dark:text-slate-50">{registration.hackathonName}</h3>
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
                    <div className="rounded-[24px] border border-slate-100 bg-slate-50/80 px-4 py-4 dark:border-white/10 dark:bg-slate-800/70">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">Registered On</p>
                      <p className="mt-3 inline-flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-slate-100">
                        <Calendar size={16} className="text-violet-500" />
                        {new Date(registration.registrationDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="rounded-[24px] border border-slate-100 bg-slate-50/80 px-4 py-4 dark:border-white/10 dark:bg-slate-800/70">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">Location</p>
                      <p className="mt-3 inline-flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-slate-100">
                        <MapPin size={16} className="text-rose-500" />
                        {registration.location}
                      </p>
                    </div>
                    <div className="rounded-[24px] border border-slate-100 bg-slate-50/80 px-4 py-4 dark:border-white/10 dark:bg-slate-800/70">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">Hackathon Dates</p>
                      <p className="mt-3 inline-flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-slate-100">
                        <Calendar size={16} className="text-blue-500" />
                        {new Date(registration.startDate).toLocaleDateString()} -{" "}
                        {new Date(registration.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="rounded-[24px] border border-slate-100 bg-slate-50/80 px-4 py-4 dark:border-white/10 dark:bg-slate-800/70">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">Team Info</p>
                      <p className="mt-3 inline-flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-slate-100">
                        <Users size={16} className="text-emerald-500" />
                        {registration.teamName} ({registration.teamMembers} member
                        {registration.teamMembers !== 1 ? "s" : ""})
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 rounded-[24px] border border-slate-100 bg-slate-50 px-4 py-4 dark:border-white/10 dark:bg-slate-800/60">
                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                      <ShieldCheck size={16} />
                      Registration ID
                    </div>
                    <code className="mt-3 inline-block rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-white/10 dark:bg-slate-900 dark:text-slate-300">
                      {registration._id}
                    </code>
                  </div>
                </div>

                <div className="xl:w-52">
                  <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition duration-300 hover:-translate-y-0.5 hover:shadow-violet-500/30">
                    <ExternalLink size={16} />
                    View Details
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-[30px] border border-dashed border-slate-300 bg-white/80 px-6 py-16 text-center shadow-sm dark:border-white/10 dark:bg-slate-900/60">
          <p className="text-lg font-semibold text-slate-800 dark:text-slate-100">No registrations yet</p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Browse approved hackathons and register to see them here instantly.
          </p>
        </div>
      )}
    </div>
  );
};

export default RegisteredHackathons;
