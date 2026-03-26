import React, { useEffect, useMemo, useState } from "react";
import { CheckCircle, Clock, XCircle } from "lucide-react";
import { apiClient } from "../../api/client";
import { useRealtimeStream } from "../../hooks/useRealtimeStream";

const toneMap = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700"
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
      // Fetch all hackathons (pending, approved, rejected)
      const response = await apiClient.getAdminHackathons();
      // Sort to show pending first
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
      const response = await apiClient.updateHackathonApproval(hackathonId, {
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
      console.error('Approval error:', err);
      setError(err.message || "Failed to update approval. Please try again.");
    } finally {
      setWorkingId("");
    }
  };

  if (loading) {
    return <div className="py-16 text-center text-slate-500">Loading approval queue...</div>;
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <style jsx>{`
        @keyframes feature-fade-up {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
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

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[26px] border border-amber-200 bg-amber-50 px-5 py-5 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:scale-105 animate-slideUp" style={{ animationDelay: '0ms' }}>
          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">Pending</div>
          <div className="mt-3 text-4xl font-bold text-slate-950 transition-all duration-500">{stats.pending}</div>
        </div>
        <div className="rounded-[26px] border border-emerald-200 bg-emerald-50 px-5 py-5 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:scale-105 animate-slideUp" style={{ animationDelay: '100ms' }}>
          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Approved</div>
          <div className="mt-3 text-4xl font-bold text-slate-950 transition-all duration-500">{stats.approved}</div>
        </div>
        <div className="rounded-[26px] border border-red-200 bg-red-50 px-5 py-5 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:scale-105 animate-slideUp" style={{ animationDelay: '200ms' }}>
          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-red-700">Rejected</div>
          <div className="mt-3 text-4xl font-bold text-slate-950 transition-all duration-500">{stats.rejected}</div>
        </div>
      </section>

      <section className="space-y-4">
        {hackathons.length > 0 ? (
          hackathons.map((hackathon, index) => (
            <article
              key={hackathon._id}
              className="overflow-hidden rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-1"
              style={{ animation: `feature-fade-up 0.55s ease-out ${index * 0.05}s both` }}
            >
              <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h4 className="text-2xl font-bold text-slate-950">{hackathon.title}</h4>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${toneMap[hackathon.approvalStatus]}`}>
                      {hackathon.approvalStatus}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{hackathon.description}</p>
                  <div className="mt-5 grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl bg-slate-50 px-4 py-3">
                      <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Organizer</div>
                      <p className="mt-2 font-semibold text-slate-900">{hackathon.organizerName}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 px-4 py-3">
                      <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Schedule</div>
                      <p className="mt-2 font-semibold text-slate-900">
                        {new Date(hackathon.startDate).toLocaleDateString()} -{" "}
                        {new Date(hackathon.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 px-4 py-3">
                      <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Participants</div>
                      <p className="mt-2 font-semibold text-slate-900">{hackathon.participants}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {hackathon.approvalStatus === "pending" ? (
                    <>
                      <button
                        onClick={() => updateApproval(hackathon._id, "approved")}
                        disabled={workingId === hackathon._id}
                        className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-emerald-700 hover:shadow-lg transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        <CheckCircle size={16} className="transition-transform duration-300 group-hover:rotate-12" />
                        {workingId === hackathon._id ? "Processing..." : "Approve"}
                      </button>
                      <button
                        onClick={() => updateApproval(hackathon._id, "rejected")}
                        disabled={workingId === hackathon._id}
                        className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-red-700 hover:shadow-lg transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        <XCircle size={16} className="transition-transform duration-300 group-hover:rotate-12" />
                        {workingId === hackathon._id ? "Processing..." : "Reject"}
                      </button>
                    </>
                  ) : (
                    <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 text-sm font-medium text-slate-600 transition-all duration-300">
                      <Clock size={16} className="animate-spin" style={{ animationDuration: '3s' }} />
                      Review complete
                    </div>
                  )}
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-[28px] border border-dashed border-slate-300 bg-white px-6 py-16 text-center text-slate-500">
            No hackathons in the approval queue yet.
          </div>
        )}
      </section>
    </div>
  );
};

export default HackathonApprovals;
