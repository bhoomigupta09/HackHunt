import React, { useEffect, useMemo, useState } from "react";
import { CheckCircle, Clock, Sparkles, XCircle } from "lucide-react";
import { apiClient } from "../../api/client";
import { useRealtimeStream } from "../../hooks/useRealtimeStream";

const toneMap = {
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  approved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  rejected: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300"
};

const HackathonApprovals = () => {
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [workingId, setWorkingId] = useState("");

  const adminId = localStorage.getItem("userId");

  const fetchHackathons = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await apiClient.getAdminHackathons();
      const sorted = (response.hackathons || []).sort((a, b) => {
        const statusOrder = { pending: 0, approved: 1, rejected: 2 };
        return (statusOrder[a.approvalStatus] || 3) - (statusOrder[b.approvalStatus] || 3);
      });
      setHackathons(sorted);
    } catch (err) {
      setError(err.message || "Failed to load approval queue.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHackathons();
  }, []);

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
      pending: hackathons.filter((item) => item.approvalStatus === "pending").length,
      approved: hackathons.filter((item) => item.approvalStatus === "approved").length,
      rejected: hackathons.filter((item) => item.approvalStatus === "rejected").length
    }),
    [hackathons]
  );

  const updateApproval = async (hackathonId, status) => {
    try {
      setWorkingId(hackathonId);
      setError("");
      await apiClient.updateHackathonApproval(hackathonId, {
        adminId,
        status
      });
      setSuccess(
        status === "approved"
          ? "Hackathon approved and pushed live to users."
          : "Hackathon rejected successfully."
      );
      setTimeout(() => setSuccess(""), 3000);
      await fetchHackathons();
    } catch (err) {
      console.error("Approval error:", err);
      setError(err.message || "Failed to update approval. Please try again.");
    } finally {
      setWorkingId("");
    }
  };

  if (loading) {
    return <div className="py-16 text-center text-slate-500 dark:text-slate-400">Loading approval queue...</div>;
  }

  return (
    <div className="space-y-6">
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

      <section className="rounded-[30px] border border-rose-100 bg-[radial-gradient(circle_at_top_left,rgba(244,63,94,0.16),transparent_28%),linear-gradient(135deg,#fff1f2,#ffffff)] p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-[radial-gradient(circle_at_top_left,rgba(244,63,94,0.12),transparent_28%),linear-gradient(135deg,rgba(30,41,59,0.96),rgba(15,23,42,0.9))] dark:shadow-[0_24px_80px_rgba(2,6,23,0.45)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-rose-700 dark:bg-rose-500/15 dark:text-rose-300">
              <Sparkles size={14} />
              Approval queue
            </div>
            <h3 className="mt-4 text-3xl font-bold text-slate-950 dark:text-slate-50">Hackathon approvals</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
              Review pending submissions, approve strong events, and keep the platform quality bar high.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-[26px] border border-amber-200 bg-amber-50 px-5 py-5 shadow-sm dark:border-amber-500/20 dark:bg-amber-500/10">
            <div className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">Pending</div>
            <div className="mt-3 text-4xl font-bold text-slate-950 dark:text-slate-50">{stats.pending}</div>
          </div>
          <div className="rounded-[26px] border border-emerald-200 bg-emerald-50 px-5 py-5 shadow-sm dark:border-emerald-500/20 dark:bg-emerald-500/10">
            <div className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Approved</div>
            <div className="mt-3 text-4xl font-bold text-slate-950 dark:text-slate-50">{stats.approved}</div>
          </div>
          <div className="rounded-[26px] border border-red-200 bg-red-50 px-5 py-5 shadow-sm dark:border-red-500/20 dark:bg-red-500/10">
            <div className="text-sm font-semibold uppercase tracking-[0.2em] text-red-700">Rejected</div>
            <div className="mt-3 text-4xl font-bold text-slate-950 dark:text-slate-50">{stats.rejected}</div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        {hackathons.length > 0 ? (
          hackathons.map((hackathon, index) => (
            <article
              key={hackathon._id}
              className="overflow-hidden rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-1 dark:border-white/10 dark:bg-slate-900/75 dark:shadow-[0_18px_60px_rgba(2,6,23,0.45)]"
              style={{ animation: `feature-fade-up 0.55s ease-out ${index * 0.05}s both` }}
            >
              <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h4 className="text-2xl font-bold text-slate-950 dark:text-slate-50">{hackathon.title}</h4>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${toneMap[hackathon.approvalStatus]}`}>
                      {hackathon.approvalStatus}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{hackathon.description}</p>
                  <div className="mt-5 grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-800/70">
                      <div className="text-xs uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">Organizer</div>
                      <p className="mt-2 font-semibold text-slate-900 dark:text-slate-100">{hackathon.organizerName}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-800/70">
                      <div className="text-xs uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">Schedule</div>
                      <p className="mt-2 font-semibold text-slate-900 dark:text-slate-100">
                        {new Date(hackathon.startDate).toLocaleDateString()} - {new Date(hackathon.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-800/70">
                      <div className="text-xs uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">Participants</div>
                      <p className="mt-2 font-semibold text-slate-900 dark:text-slate-100">{hackathon.participants}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {hackathon.approvalStatus === "pending" ? (
                    <>
                      <button
                        onClick={() => updateApproval(hackathon._id, "approved")}
                        disabled={workingId === hackathon._id}
                        className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        <CheckCircle size={16} />
                        {workingId === hackathon._id ? "Processing..." : "Approve"}
                      </button>
                      <button
                        onClick={() => updateApproval(hackathon._id, "rejected")}
                        disabled={workingId === hackathon._id}
                        className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        <XCircle size={16} />
                        {workingId === hackathon._id ? "Processing..." : "Reject"}
                      </button>
                    </>
                  ) : (
                    <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 text-sm font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      <Clock size={16} />
                      Review complete
                    </div>
                  )}
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-[28px] border border-dashed border-slate-300 bg-white px-6 py-16 text-center text-slate-500 dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-400">
            No hackathons in the approval queue yet.
          </div>
        )}
      </section>
    </div>
  );
};

export default HackathonApprovals;
