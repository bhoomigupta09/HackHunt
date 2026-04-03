import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Calendar, CheckCircle, Clock, Compass, Globe, MapPin, Radar, Search, X } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// IMPORT YOUR LOCAL JSON DATA HERE
import mockHackathons from "../data/unstop_scraped_data.json";

// We will use "ongoing" in UI to match your preference
const STATUS_OPTIONS = ["all", "ongoing", "upcoming", "ended"];

const normalizeLocation = (value = "") => value.trim().toLowerCase();

// PRE-CACHED COORDINATES FOR INSTANT LOADING
const KNOWN_CITIES = {
  "delhi": { lat: 28.6139, lng: 77.2090 },
  "new delhi": { lat: 28.6139, lng: 77.2090 },
  "mumbai": { lat: 19.0760, lng: 72.8777 },
  "dhanbad": { lat: 23.7957, lng: 86.4304 },
  "bangalore": { lat: 12.9716, lng: 77.5946 },
  "pune": { lat: 18.5204, lng: 73.8567 },
  "yelahanka": { lat: 13.1007, lng: 77.5963 },
  "greater noida": { lat: 28.4744, lng: 77.5040 },
  "chennai": { lat: 13.0827, lng: 80.2707 },
  "pilani": { lat: 28.3802, lng: 75.6083 },
  "ramanagara": { lat: 12.7150, lng: 77.2813 },
  "navi mumbai": { lat: 19.0330, lng: 73.0297 },
  "meerut": { lat: 28.9845, lng: 77.7064 },
  "roorkee": { lat: 29.8543, lng: 77.8880 },
  "jammu": { lat: 32.7266, lng: 74.8570 },
  "dharuhera": { lat: 28.2055, lng: 76.7953 },
  "nashik": { lat: 19.9975, lng: 73.7898 },
  "kolkata": { lat: 22.5726, lng: 88.3639 },
  "jaipur": { lat: 26.9124, lng: 75.7873 },
  "rajasthan": { lat: 26.9124, lng: 75.7873 } // added default for rajasthan state searches
};

const hasValidCoordinates = (hackathon) =>
  Number.isFinite(Number(hackathon?.latitude)) &&
  Number.isFinite(Number(hackathon?.longitude));

const HackathonTrackingMap = () => {
  const [hackathons, setHackathons] = useState([]);
  const [filteredHackathons, setFilteredHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLocation, setSearchLocation] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);

  // Determine Status
  const getHackathonStatus = useCallback((hackathon) => {
    // Priority 1: Check status field first - this is most reliable
    const normalizedStatus = String(hackathon?.status || "").toLowerCase();
    if (normalizedStatus === "open" || normalizedStatus === "active") return "ongoing";
    if (normalizedStatus === "ended" || normalizedStatus === "closed") return "ended";
    if (normalizedStatus === "upcoming" || normalizedStatus === "scheduled") return "upcoming";

    // Priority 2: Fall back to date-based logic only if status doesn't tell us
    try {
      const cleanStartDateStr = (hackathon.startDate || "").replace("Posted ", "").trim();
      const start = new Date(cleanStartDateStr);
      const end = hackathon.endDate ? new Date(hackathon.endDate) : new Date(start.getTime() + (3 * 24 * 60 * 60 * 1000));
      const now = new Date();

      if (!isNaN(end.getTime()) && end < now) return "ended";
      if (!isNaN(start.getTime()) && start > now) return "upcoming";
      if (!isNaN(start.getTime()) && start <= now && end >= now) return "ongoing";
    } catch (e) {}
    
    // Priority 3: Safe default
    return "upcoming";
  }, []);

  // AUTO-GEOCODER
  const autoGeocodeLocations = async (items) => {
    const updatedItems = [];
    
    for (const item of items) {
      if (hasValidCoordinates(item)) {
        updatedItems.push(item);
        continue;
      }

      const locStr = (item.location || "").toLowerCase();
      if (locStr === "online" || locStr === "tba" || !locStr) {
        updatedItems.push(item);
        continue;
      }

      // Check predefined fast dictionary first
      let matched = false;
      for (const [city, coords] of Object.entries(KNOWN_CITIES)) {
        if (locStr.includes(city)) {
          const latOffset = (Math.random() - 0.5) * 0.03; // Spread out pins in same city
          const lngOffset = (Math.random() - 0.5) * 0.03;
          updatedItems.push({
            ...item,
            latitude: coords.lat + latOffset,
            longitude: coords.lng + lngOffset
          });
          matched = true;
          break;
        }
      }

      if (!matched) {
        // Fallback to cache/api if not in dictionary
        const cacheKey = `hackhunt_geo_${normalizeLocation(item.location)}`;
        const cachedCoordsStr = localStorage.getItem(cacheKey);
        
        if (cachedCoordsStr) {
          const coords = JSON.parse(cachedCoordsStr);
          if (coords && coords.lat) {
            updatedItems.push({ ...item, latitude: coords.lat, longitude: coords.lng });
          } else {
            updatedItems.push(item);
          }
        } else {
          updatedItems.push(item); // Leave without coords if not cached to avoid blocking UI
        }
      }
    }
    return updatedItems;
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const formattedMockData = mockHackathons.map((h) => ({
        ...h,
        _id: h.id,
        mode: h.type,
      }));
      const enrichedHackathons = await autoGeocodeLocations(formattedMockData);
      setHackathons(enrichedHackathons);
      setLoading(false);
    };
    loadData();
  }, []);

  // Instant Filter Engine
  useEffect(() => {
    const locationTerm = normalizeLocation(searchLocation);
    const filtered = hackathons.filter((hackathon) => {
      const locationHaystack = normalizeLocation(hackathon.location || "");
      const status = getHackathonStatus(hackathon);
      
      const matchesLocation = !locationTerm || locationHaystack.includes(locationTerm);
      const matchesStatus = selectedStatus === "all" || status === selectedStatus;
      
      return matchesLocation && matchesStatus;
    });
    setFilteredHackathons(filtered);
  }, [hackathons, searchLocation, selectedStatus, getHackathonStatus]);

  // Live Stats Calculator based on current filters
  const stats = useMemo(() => {
    return {
      total: filteredHackathons.length,
      ongoing: filteredHackathons.filter(h => getHackathonStatus(h) === "ongoing").length,
      upcoming: filteredHackathons.filter(h => getHackathonStatus(h) === "upcoming").length,
      ended: filteredHackathons.filter(h => getHackathonStatus(h) === "ended").length,
      online: filteredHackathons.filter(h => (h.location || "").toLowerCase().includes("online")).length
    };
  }, [filteredHackathons, getHackathonStatus]);

  // Group by location for Map Pins
  const locationGroups = useMemo(() => {
    const groups = new Map();
    filteredHackathons
      .filter(hasValidCoordinates) 
      .forEach((hackathon) => {
        const key = `${hackathon.latitude.toFixed(2)}:${hackathon.longitude.toFixed(2)}`;

        if (!groups.has(key)) {
          const parts = hackathon.location.split(',');
          const displayName = parts.length > 2 ? parts.slice(-3).join(',').trim() : hackathon.location;

          groups.set(key, {
            key,
            location: displayName,
            items: [],
            latitude: hackathon.latitude,
            longitude: hackathon.longitude,
            statusCounts: { ongoing: 0, upcoming: 0, ended: 0 }
          });
        }

        const group = groups.get(key);
        const status = getHackathonStatus(hackathon);
        group.items.push(hackathon);
        group.statusCounts[status] = (group.statusCounts[status] || 0) + 1;
      });

    return Array.from(groups.values());
  }, [filteredHackathons, getHackathonStatus]);

  // Render Leaflet Map
  useEffect(() => {
    if (mapInstance.current) {
      mapInstance.current.remove();
      mapInstance.current = null;
    }
    markersRef.current = [];
    if (!mapRef.current) return undefined;

    mapInstance.current = L.map(mapRef.current).setView([22.5937, 78.9629], 5);
    
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 19
    }).addTo(mapInstance.current);

    if (!locationGroups.length) return undefined;

    const bounds = [];
    
    locationGroups.forEach((group) => {
      // Create a custom numbered PIN
      const pinColor = group.statusCounts.ongoing > 0 ? "bg-emerald-500" 
                     : group.statusCounts.upcoming > 0 ? "bg-blue-500" 
                     : "bg-slate-600";

      const customIcon = L.divIcon({
        className: 'custom-pin bg-transparent border-0',
        html: `
          <div class="relative flex items-center justify-center w-10 h-10">
            <div class="absolute inset-0 ${pinColor} rounded-full opacity-30 animate-ping"></div>
            <div class="relative z-10 flex items-center justify-center w-8 h-8 ${pinColor} text-white font-bold text-sm rounded-full shadow-lg border-2 border-white">
              ${group.items.length}
            </div>
            <div class="absolute -bottom-1 left-1/2 w-2 h-2 ${pinColor} transform -translate-x-1/2 rotate-45 border-r-2 border-b-2 border-white"></div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 36],
        popupAnchor: [0, -36]
      });
      
      const marker = L.marker([group.latitude, group.longitude], { icon: customIcon })
                      .addTo(mapInstance.current);

      const titlesHtml = group.items
        .slice(0, 5)
        .map(h => `<li class="truncate py-1.5 border-b border-slate-100 last:border-0 font-medium text-slate-800">• ${h.title}</li>`)
        .join('');
      
      const moreHtml = group.items.length > 5 
        ? `<li class="py-1 text-violet-600 font-bold text-[11px]">+ ${group.items.length - 5} more events here</li>` 
        : '';

      const statusLine = `
        <span class="text-emerald-600 font-bold">${group.statusCounts.ongoing} Ongoing</span> • 
        <span class="text-blue-600 font-bold">${group.statusCounts.upcoming} Upcoming</span>
      `;
      
      marker.bindPopup(
        `<div class="font-sans p-2 min-w-[240px] max-w-[280px]">
          <h4 class="font-bold text-xs mb-2 text-slate-500 uppercase tracking-wider border-b border-slate-200 pb-2 flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            ${group.location}
          </h4>
          <ul class="text-sm mb-3 m-0 p-0 list-none">
            ${titlesHtml}
            ${moreHtml}
          </ul>
          <div class="text-[10px] bg-slate-50 p-2 rounded-lg border border-slate-100 text-center">
            ${statusLine}
          </div>
        </div>`,
        { className: 'rounded-xl overflow-hidden shadow-xl' }
      );

      bounds.push([group.latitude, group.longitude]);
      markersRef.current.push(marker);
    });

    if (bounds.length === 1) {
      mapInstance.current.setView(bounds[0], 11);
    } else if (bounds.length > 1) {
      mapInstance.current.fitBounds(L.latLngBounds(bounds), { padding: [50, 50], maxZoom: 12 });
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
      markersRef.current = [];
    };
  }, [locationGroups]);

  if (loading) {
    return (
      <div className="rounded-[32px] border border-white/70 bg-white/80 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-900/70 dark:shadow-[0_24px_80px_rgba(2,6,23,0.45)]">
        <div className="flex h-[500px] w-full flex-col items-center justify-center rounded-[28px] bg-slate-50 dark:bg-slate-800/70">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-violet-500 border-t-transparent mb-4"></div>
          <p className="font-bold text-slate-700 dark:text-slate-200">Loading Map Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 rounded-[34px] border border-white/70 bg-[radial-gradient(circle_at_top_right,rgba(167,139,250,0.18),transparent_24%),linear-gradient(135deg,rgba(255,255,255,0.92),rgba(248,250,252,0.82))] p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-[radial-gradient(circle_at_top_right,rgba(167,139,250,0.16),transparent_24%),linear-gradient(135deg,rgba(30,41,59,0.96),rgba(15,23,42,0.9))] dark:shadow-[0_24px_80px_rgba(2,6,23,0.45)]">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
            <Radar size={14} />
            Live tracking
          </div>
          <h3 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-slate-950 dark:text-slate-50">Hackathon Radar</h3>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-300 sm:text-base">
            Search locations and track events in real-time.
          </p>
        </div>

        <div className="relative w-full lg:w-[28rem]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Type city (e.g., Delhi, Pune)..."
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white/85 py-3.5 pl-12 pr-10 text-sm font-medium text-slate-900 shadow-[inset_0_1px_2px_rgba(15,23,42,0.04)] outline-none transition-all focus:border-violet-300 focus:ring-4 focus:ring-violet-500/10 dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-100"
          />
          {searchLocation && (
            <button
              onClick={() => setSearchLocation("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-5">
        <div className="flex items-center gap-4 rounded-[24px] border border-slate-200 bg-white/80 p-4 shadow-sm transition duration-300 hover:-translate-y-0.5 dark:border-white/10 dark:bg-slate-800/80">
          <div className="rounded-2xl bg-violet-50 p-3 shadow-sm"><MapPin className="text-violet-600" size={20} /></div>
          <div>
            <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-500">Total Events</p>
            <p className="text-2xl font-black text-slate-900 dark:text-slate-50">{stats.total}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-[24px] border border-emerald-100 bg-emerald-50 p-4 shadow-sm transition duration-300 hover:-translate-y-0.5 dark:border-emerald-500/20 dark:bg-emerald-500/10">
          <div className="rounded-2xl bg-white p-3 shadow-sm"><CheckCircle className="text-emerald-500" size={20} /></div>
          <div>
            <p className="text-xs font-bold text-emerald-700 uppercase">Ongoing</p>
            <p className="text-2xl font-black text-emerald-900">{stats.ongoing}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-[24px] border border-blue-100 bg-blue-50 p-4 shadow-sm transition duration-300 hover:-translate-y-0.5 dark:border-blue-500/20 dark:bg-blue-500/10">
          <div className="rounded-2xl bg-white p-3 shadow-sm"><Calendar className="text-blue-500" size={20} /></div>
          <div>
            <p className="text-xs font-bold text-blue-700 uppercase">Upcoming</p>
            <p className="text-2xl font-black text-blue-900">{stats.upcoming}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-[24px] border border-slate-200 bg-slate-100 p-4 shadow-sm transition duration-300 hover:-translate-y-0.5 dark:border-white/10 dark:bg-slate-800/80">
          <div className="rounded-2xl bg-white p-3 shadow-sm"><Clock className="text-slate-500" size={20} /></div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Ended</p>
            <p className="text-2xl font-black text-slate-700">{stats.ended}</p>
          </div>
        </div>
        <div className="col-span-2 flex items-center gap-4 rounded-[24px] border border-violet-100 bg-violet-50/80 p-4 shadow-sm transition duration-300 hover:-translate-y-0.5 dark:border-violet-500/20 dark:bg-violet-500/10 xl:col-span-1">
          <div className="rounded-2xl bg-white p-3 shadow-sm"><Compass className="text-violet-500" size={20} /></div>
          <div>
            <p className="text-xs font-bold uppercase text-violet-700">Online Events</p>
            <p className="text-2xl font-black text-violet-900">{stats.online}</p>
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-white/70 bg-white/75 p-5 shadow-sm dark:border-white/10 dark:bg-slate-900/70">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <span className="mr-2 text-sm font-bold text-slate-700 dark:text-slate-200">Filter Status:</span>
            {STATUS_OPTIONS.map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`rounded-full px-5 py-2.5 text-sm font-semibold capitalize transition-all duration-300 ${
                  selectedStatus === status
                    ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/25"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-violet-200 hover:text-violet-700 dark:border-white/10 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-violet-500/30 dark:hover:text-violet-300"
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {stats.online > 0 && (
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50 px-4 py-2 text-xs font-bold text-violet-700 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-300">
              <Globe size={16} />
              {stats.online} Online Events (Not on map)
            </div>
          )}
        </div>
      </div>

      <div className="relative overflow-hidden rounded-[30px] border border-white/70 bg-white/80 p-3 shadow-[0_24px_70px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-slate-900/70 dark:shadow-[0_24px_70px_rgba(2,6,23,0.45)]">
        {locationGroups.length > 0 ? (
          <div className="overflow-hidden rounded-[24px] border border-slate-200 shadow-inner dark:border-white/10">
            <div
              ref={mapRef}
              className="z-0 h-[550px] w-full"
              style={{ background: "#e5e7eb" }}
            />
          </div>
        ) : (
          <div className="flex h-[550px] w-full flex-col items-center justify-center rounded-[24px] bg-slate-50 dark:bg-slate-800/70">
            <MapPin className="mb-3 h-12 w-12 text-slate-300 dark:text-slate-600" />
            <p className="text-lg font-bold text-slate-600 dark:text-slate-200">No locations found</p>
            <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">Try searching for a different city or changing the status filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HackathonTrackingMap;
