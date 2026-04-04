import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Calendar,
  Filter,
  MapPin,
  Search,
  Sparkles,
  Trophy,
  Globe,
  Info
} from "lucide-react";
import { apiClient } from "../../api/client";
import mockHackathons from "../../data/unstop_scraped_data.json";

/** * CLEANER: Sanitizes date strings for Reliable Parsing
 * Strips common scraper prefixes like "Posted", "Ends in", etc.
 */
const cleanDate = (dateStr) => {
  if (!dateStr || dateStr === "N/A") return null;
  return dateStr.replace(/(Posted|Ends|Starts|in|on|at)/gi, "").trim();
};

/** Map GET /hackathons/live items to the card model used in this component */
function mapLiveApiToCard(h) {
  const deadlineStr = cleanDate(h.deadline);
  let calculatedStatus = "upcoming"; 

  if (deadlineStr) {
    const end = Date.parse(deadlineStr);
    if (!Number.isNaN(end)) {
      calculatedStatus = end < Date.now() ? "ended" : "ongoing";
    }
  }

  const desc = Array.isArray(h.tags) && h.tags.length
      ? h.tags.join(" · ")
      : `Listed on ${h.platform || "Unstop"}. Open the event page to register.`;

  return {
    _id: h.id || h._id,
    id: h.id || h._id,
    title: h.title,
    description: desc,
    organizerName: h.platform || h.organization || h.organizer || "External",
    location: h.location || "Online",
    totalPrize: h.prize || h.totalPrize,
    prize: h.prize || h.totalPrize,
    imageUrl: h.image || h.logoUrl || h.bannerUrl || "https://unstop.com/images/unstop-logo.svg",
    mode: h.mode || h.type || "online",
    calculatedStatus,
    startDate: h.startDate || h.deadline || "See event page",
    endDate: h.endDate || h.deadline,
    tags: Array.isArray(h.tags) ? h.tags : [],
    registrationUrl: h.url || h.registrationUrl || (h.seo_url ? `https://unstop.com/${h.seo_url}` : null),
    isLiveScraped: true,
    sourcePlatform: h.platform || "Unstop"
  };
}

const getStatusTone = (status) => {
  if (status === "ongoing") return "bg-emerald-500/20 text-emerald-100 border-emerald-500/30";
  if (status === "ended") return "bg-slate-800/60 text-slate-300 border-slate-600/50";
  if (status === "upcoming") return "bg-blue-500/20 text-blue-100 border-blue-500/30";
  return "bg-slate-100 text-slate-600 border-slate-200";
};

const getModeIcon = (mode) => {
  const normalizedMode = String(mode).toLowerCase();
  if (normalizedMode.includes("online")) return <Globe size={14} className="mr-1" />;
  if (normalizedMode.includes("in-person") || normalizedMode.includes("offline")) return <MapPin size={14} className="mr-1" />;
  return <Sparkles size={14} className="mr-1" />;
};

// Robust Status Parser for local/mock data
const getHackathonStatus = (hackathon) => {
  try {
    const startStr = cleanDate(hackathon.startDate);
    const endStr = cleanDate(hackathon.endDate);
    
    const now = new Date();
    const start = startStr ? new Date(startStr) : null;
    const end = endStr ? new Date(endStr) : (start ? new Date(start.getTime() + 86400000 * 3) : null);

    if (end && !isNaN(end.getTime()) && end < now) return "ended";
    if (start && !isNaN(start.getTime()) && start > now) return "upcoming";
    
    const normalized = String(hackathon?.status || "").toLowerCase();
    if (normalized === "open" || normalized === "active" || normalized === "approved") return "ongoing";
    
    return "ongoing"; 
  } catch (e) {
    return "ongoing";
  }
};

function formatMockRow(h) {
  const calculatedStatus = getHackathonStatus(h);
  return {
    ...h,
    _id: h.id || h._id,
    id: h.id || h._id,
    title: h.title,
    description: h.description || h.details || "More details available on the event page.",
    imageUrl: h.logoUrl || h.bannerUrl || h.image || h.imageUrl || "https://unstop.com/images/unstop-logo.svg",
    registrationUrl: h.seo_url ? `https://unstop.com/${h.seo_url}` : (h.url || h.registrationUrl),
    mode: h.type || h.mode || "online",
    organizerName: h.organizer || h.organization || "Unstop",
    prize: h.totalPrize || h.prize || "See page",
    calculatedStatus
  };
}

const BrowseHackathons = ({ user, initialSearchTerm = "" }) => {
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [dataSource, setDataSource] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      let rows = [];
      try {
        const res = await apiClient.getLiveScrapedHackathons();
        const live = res.hackathons || [];
        rows = live.map(mapLiveApiToCard);
        if (rows.length > 0) setDataSource("live");
      } catch (apiErr) {
        console.warn("Live API fallback to local:", apiErr?.message);
      }

      if (rows.length === 0) {
        rows = mockHackathons.map(formatMockRow);
        setDataSource("local");
      }

      setHackathons(rows);
    } catch (err) {
      setError("Could not load hackathons.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    if (initialSearchTerm) setSearchTerm(initialSearchTerm.trim());
  }, [initialSearchTerm]);

  const filteredHackathons = useMemo(() => {
    return hackathons.filter((h) => {
      const searchTarget = `${h.title} ${h.description} ${h.organizerName} ${h.location} ${h.sourcePlatform}`.toLowerCase();
      const matchesSearch = !searchTerm || searchTarget.includes(searchTerm.toLowerCase().trim());
      const matchesStatus = filterStatus === "all" || h.calculatedStatus === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [filterStatus, hackathons, searchTerm]);

  // FULLY FIXED: URL construction is now safe
  const handleRegister = (hackathon) => {
    let url = hackathon.registrationUrl || hackathon.url;
    
    if (url) {
      if (url.startsWith("http://") || url.startsWith("https://")) {
        // It's already a full valid URL, do nothing
      } else {
        // It's a relative path, safely append unstop.com
        const cleanPath = url.startsWith("/") ? url.substring(1) : url;
        url = `https://unstop.com/${cleanPath}`;
      }
      
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      setError("Registration link is currently unavailable.");
      setTimeout(() => setError(""), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 relative">
      {/* Error Toast */}
      {error && (
        <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-6 py-3 rounded-xl shadow-lg font-bold animate-bounce">
          {error}
        </div>
      )}

      {/* Header Stats */}
      <section className="rounded-[28px] border border-slate-200 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.16),transparent_28%),linear-gradient(135deg,#ffffff,#f8fafc)] p-6 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-700">
              <Sparkles size={14} /> {dataSource === "live" ? "LIVE FEED" : "LOCAL DATABASE"}
            </div>
            <h3 className="mt-4 text-3xl font-bold text-slate-950">Browse Hackathons</h3>
          </div>
          <div className="flex gap-4">
            <div className="rounded-2xl bg-white border p-4 text-center">
              <p className="text-xs font-bold text-slate-400">TOTAL</p>
              <p className="text-2xl font-bold">{hackathons.length}</p>
            </div>
            <div className="rounded-2xl bg-white border p-4 text-center">
              <p className="text-xs font-bold text-emerald-500">ACTIVE</p>
              <p className="text-2xl font-bold">
                {hackathons.filter(h => h.calculatedStatus !== "ended").length}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Search & Filter Bar */}
      <div className="flex flex-col gap-4 lg:flex-row p-4 bg-white/50 rounded-3xl border border-white">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search hackathons..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-violet-100 transition outline-none"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-2xl border border-slate-200 px-6 py-3 font-semibold text-slate-700 outline-none"
        >
          <option value="all">All Status</option>
          <option value="upcoming">Upcoming</option>
          <option value="ongoing">Ongoing</option>
          <option value="ended">Ended</option>
        </select>
      </div>

      {/* Grid */}
      {filteredHackathons.length > 0 ? (
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
          {filteredHackathons.map((hackathon, index) => (
            <article
              key={hackathon._id || index}
              className="group flex flex-col overflow-hidden rounded-[32px] border border-slate-200 bg-white transition-all hover:shadow-xl hover:-translate-y-1"
            >
              <div className="relative h-48 w-full bg-slate-100 flex items-center justify-center">
                {hackathon.imageUrl ? (
                  <img src={hackathon.imageUrl} className="h-full w-full object-cover" alt="banner" 
                       onError={(e) => { e.target.src = "https://unstop.com/images/unstop-logo.svg"; e.target.className = "h-1/2 w-1/2 object-contain opacity-50"; }}/>
                ) : (
                  <Sparkles className="text-slate-300" size={48} />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusTone(hackathon.calculatedStatus)}`}>
                  {hackathon.calculatedStatus}
                </span>
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h4 className="text-xl font-bold truncate">{hackathon.title}</h4>
                  <p className="text-sm opacity-80">{hackathon.organizerName}</p>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <p className="text-sm text-slate-600 line-clamp-2 mb-4">{hackathon.description}</p>
                
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex items-center text-xs font-semibold text-slate-500">
                    <Calendar size={14} className="mr-1 text-violet-500" /> {hackathon.startDate}
                  </div>
                  <div className="flex items-center text-xs font-semibold text-slate-500">
                    {getModeIcon(hackathon.mode)} <span className="capitalize">{hackathon.mode}</span>
                  </div>
                  <div className="flex items-center text-xs font-semibold text-slate-500">
                    <Trophy size={14} className="mr-1 text-amber-500" /> {hackathon.prize}
                  </div>
                </div>
                
                <div className="mt-auto pt-4 border-t flex gap-3">
                  <Link
                    to={`/hackathons/${hackathon._id}`}
                    className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                  >
                    <Info size={16} />
                    View Details
                  </Link>
                  <button
                    onClick={() => handleRegister(hackathon)}
                    disabled={hackathon.calculatedStatus === "ended"}
                    className="flex-1 bg-violet-600 text-white py-3 rounded-xl font-bold hover:bg-violet-700 disabled:bg-slate-300 transition-all flex items-center justify-center gap-2"
                  >
                    {hackathon.calculatedStatus === "ended" ? "Closed" : "Register Now"}
                    <ArrowUpRight size={16} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed">
          <p className="text-slate-400 font-bold">No hackathons found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default BrowseHackathons;