import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Calendar,
  Filter,
  MapPin,
  Search,
  Sparkles,
  Users
} from "lucide-react";
import { apiClient } from "../../api/client";
import { useRealtimeStream } from "../../hooks/useRealtimeStream";

const getStatusTone = (status) => {
  if (status === "ongoing") return "bg-emerald-100 text-emerald-700";
  if (status === "ended") return "bg-slate-200 text-slate-700";
  return "bg-blue-100 text-blue-700";
};

const BrowseHackathons = ({ user, initialSearchTerm = "" }) => {
  const [hackathons, setHackathons] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const userId = localStorage.getItem("userId");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [hackathonResponse, registrationResponse] = await Promise.all([
        apiClient.getHackathons(),
        userId ? apiClient.getUserRegistrations(userId) : Promise.resolve({ registrations: [] })
      ]);
      setHackathons(hackathonResponse.hackathons || []);
      setRegistrations(registrationResponse.registrations || []);
    } catch (err) {
      setError(err.message || "Failed to load hackathons.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (typeof initialSearchTerm === "string" && initialSearchTerm.trim()) {
      setSearchTerm(initialSearchTerm.trim());
    }
  }, [initialSearchTerm]);

  useRealtimeStream({
    "hackathon:created": loadData,
    "hackathon:updated": loadData,
    "hackathon:deleted": loadData,
    "hackathon:approval-updated": loadData,
    "registration:created": loadData,
    "registration:deleted": loadData
  });

  const registeredHackathonIds = useMemo(
    () => new Set(registrations.map((item) => item.hackathonId)),
    [registrations]
  );

  const filteredHackathons = useMemo(() => {
    return hackathons.filter((hackathon) => {
      const matchesSearch =
        !searchTerm ||
        hackathon.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hackathon.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(hackathon.organizerName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(hackathon.location || "").toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = filterStatus === "all" || hackathon.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [filterStatus, hackathons, searchTerm]);

  const handleRegister = async (hackathon) => {
    try {
      setSubmittingId(hackathon._id);
      setError("");
      setSuccess("");
      await apiClient.registerForHackathon(hackathon._id, {
        userId,
        teamName: `${user?.name || "Solo"} Squad`,
        teamMembers: 1
      });
      setSuccess(`You are now registered for ${hackathon.title}.`);
      setTimeout(() => setSuccess(""), 3000);
      await loadData();
    } catch (err) {
      setError(err.message || "Failed to register for hackathon.");
    } finally {
      setSubmittingId("");
    }
  };

  if (loading) {
    return <div className="py-16 text-center text-slate-500">Loading live hackathons...</div>;
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[28px] border border-slate-200 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.16),transparent_28%),linear-gradient(135deg,#ffffff,#f8fafc)] p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-violet-700">
              <Sparkles size={14} />
              Live Discovery
            </div>
            <h3 className="mt-4 text-3xl font-bold tracking-[-0.04em] text-slate-950">
              Browse approved hackathons in real time
            </h3>
            <p className="mt-3 text-base leading-7 text-slate-600">
              This list updates automatically when organizers submit changes and admins approve them.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-4">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">
                Visible Now
              </div>
              <div className="mt-2 text-3xl font-bold text-slate-950">{hackathons.length}</div>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                Ongoing
              </div>
              <div className="mt-2 text-3xl font-bold text-slate-950">
                {hackathons.filter((item) => item.status === "ongoing").length}
              </div>
            </div>
            <div className="rounded-2xl border border-violet-200 bg-violet-50 px-4 py-4">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-700">
                Registered
              </div>
              <div className="mt-2 text-3xl font-bold text-slate-950">{registrations.length}</div>
            </div>
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </div>
      )}

      <section className="rounded-[28px] border border-white/70 bg-white/85 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, description, or organizer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-12 py-3.5 text-sm text-slate-900 outline-none transition focus:border-violet-300 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
              <Filter size={16} />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-violet-300"
            >
              <option value="all">All Hackathons</option>
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="ended">Ended</option>
            </select>
          </div>
        </div>

        <div className="mt-5 text-sm text-slate-500">
          Showing {filteredHackathons.length} approved hackathon
          {filteredHackathons.length !== 1 ? "s" : ""}
        </div>
      </section>

      {filteredHackathons.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {filteredHackathons.map((hackathon, index) => {
            const isRegistered = registeredHackathonIds.has(hackathon._id);
            const isFull = hackathon.participants >= hackathon.maxParticipants;
            const canRegister = !isRegistered && !isFull && hackathon.status !== "ended";

            return (
              <article
                key={hackathon._id}
                className="group relative overflow-hidden rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.07)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(79,70,229,0.12)]"
                style={{ animation: `feature-fade-up 0.55s ease-out ${index * 0.06}s both` }}
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-violet-500 to-fuchsia-500" />

                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700 bg-slate-100">
                      {hackathon.mode}
                    </div>
                    <h4 className="mt-4 text-2xl font-bold tracking-tight text-slate-950">
                      {hackathon.title}
                    </h4>
                    <p className="mt-2 text-sm leading-7 text-slate-600">{hackathon.description}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusTone(hackathon.status)}`}>
                    {hackathon.status}
                  </span>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 px-4 py-3">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Calendar size={16} />
                      Schedule
                    </div>
                    <p className="mt-2 font-semibold text-slate-900">
                      {new Date(hackathon.startDate).toLocaleDateString()} -{" "}
                      {new Date(hackathon.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 px-4 py-3">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <MapPin size={16} />
                      Location
                    </div>
                    <p className="mt-2 font-semibold text-slate-900">{hackathon.location}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 px-4 py-3">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Users size={16} />
                      Participants
                    </div>
                    <p className="mt-2 font-semibold text-slate-900">
                      {hackathon.participants}/{hackathon.maxParticipants}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 px-4 py-3">
                    <div className="text-sm text-slate-500">Organizer</div>
                    <p className="mt-2 font-semibold text-slate-900">{hackathon.organizerName}</p>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  {(hackathon.tags || []).length > 0 ? (
                    hackathon.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700"
                      >
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                      Live opportunity
                    </span>
                  )}
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-sm text-slate-500">Prize Pool</div>
                    <div className="text-2xl font-bold text-violet-700">{hackathon.prize || "To be announced"}</div>
                  </div>

                  <div className="flex gap-3">
                    {hackathon.registrationUrl && (
                      <a
                        href={hackathon.registrationUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        Visit
                        <ArrowUpRight size={16} />
                      </a>
                    )}
                    <button
                      onClick={() => handleRegister(hackathon)}
                      disabled={!canRegister || submittingId === hackathon._id}
                      className={`rounded-2xl px-5 py-3 text-sm font-semibold text-white transition ${
                        isRegistered
                          ? "bg-emerald-600"
                          : canRegister
                            ? "bg-gradient-to-r from-blue-600 via-violet-600 to-fuchsia-600 hover:shadow-lg"
                            : "bg-slate-300"
                      } disabled:cursor-not-allowed disabled:opacity-80`}
                    >
                      {isRegistered
                        ? "Registered"
                        : submittingId === hackathon._id
                          ? "Registering..."
                          : isFull
                            ? "Full"
                            : hackathon.status === "ended"
                              ? "Closed"
                              : "Register Now"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="rounded-[28px] border border-dashed border-slate-300 bg-white px-6 py-16 text-center text-slate-500">
          No approved hackathons match this filter right now.
        </div>
      )}
    </div>
  );
};

export default BrowseHackathons;
