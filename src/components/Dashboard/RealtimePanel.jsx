import React, { useEffect, useState } from "react";
import { Send, Wifi, WifiOff } from "lucide-react";
import { apiClient } from "../../api/client";
import { useRealtimeStream } from "../../hooks/useRealtimeStream";

const roleBadgeClasses = {
  user: "bg-blue-100 text-blue-700",
  organizer: "bg-amber-100 text-amber-700",
  admin: "bg-rose-100 text-rose-700"
};

const formatTime = (value) =>
  new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });

const RealtimePanel = ({ currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState("");

  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await apiClient.fetchLiveMessages();
      setMessages(response.messages || []);
    } catch (err) {
      setError(err.message || "Unable to load live updates.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  useRealtimeStream({
    connected: () => setConnected(true),
    heartbeat: () => setConnected(true),
    activity: (activity) => {
      setMessages((prev) => {
        const exists = prev.some((item) => item.id === activity.id);
        if (exists) {
          return prev;
        }
        return [activity, ...prev].slice(0, 25);
      });
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!draft.trim()) {
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      await apiClient.postLiveMessage({
        authorId: currentUser?.id,
        authorName: currentUser?.name || "Anonymous",
        authorRole: currentUser?.role || "user",
        message: draft.trim()
      });
      setDraft("");
    } catch (err) {
      setError(err.message || "Unable to post live update.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mb-8 rounded-2xl border border-slate-200 bg-slate-50/90 p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-slate-900">Live Team Feed</h3>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                connected
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {connected ? <Wifi size={14} /> : <WifiOff size={14} />}
              {connected ? "Live" : "Connecting"}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            Everyone on the dashboards can see new updates instantly and respond in real time.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex w-full max-w-xl gap-3">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Share an update with everyone online..."
            className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-0 transition focus:border-slate-400"
          />
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Send size={16} />
            {submitting ? "Sending..." : "Send"}
          </button>
        </form>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-5 grid gap-3">
        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-5 text-sm text-slate-500">
            Loading live updates...
          </div>
        ) : messages.length > 0 ? (
          messages.slice(0, 8).map((item) => (
            <article
              key={item.id}
              className="rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-slate-900">
                      {item.authorName || "System"}
                    </p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        roleBadgeClasses[item.authorRole] || "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {item.authorRole || item.type}
                    </span>
                  </div>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{item.message}</p>
                </div>
                <time className="whitespace-nowrap text-xs text-slate-400">
                  {formatTime(item.createdAt)}
                </time>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-5 text-sm text-slate-500">
            No live activity yet. Send the first update to start the conversation.
          </div>
        )}
      </div>
    </section>
  );
};

export default RealtimePanel;
