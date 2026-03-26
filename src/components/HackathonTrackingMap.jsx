import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Flame, MapPin, Search, X } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { apiClient } from "../api/client";
import { useRealtimeStream } from "../hooks/useRealtimeStream";

const STATUS_OPTIONS = ["all", "active", "upcoming", "ended", "cancelled"];

const normalizeLocation = (value = "") => value.trim().toLowerCase();
const hasValidCoordinates = (hackathon) =>
  Number.isFinite(Number(hackathon?.latitude)) &&
  Number.isFinite(Number(hackathon?.longitude));
const toCoordBucket = (latitude, longitude) =>
  `${Number(latitude).toFixed(3)}:${Number(longitude).toFixed(3)}`;

const HackathonTrackingMap = () => {
  const [hackathons, setHackathons] = useState([]);
  const [filteredHackathons, setFilteredHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchLocationDraft, setSearchLocationDraft] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [availableLocations, setAvailableLocations] = useState([]);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);
  const geocodeCacheRef = useRef(new Map());
  const navigate = useNavigate();

  const getHackathonStatus = useCallback((hackathon) => {
    const normalized = String(hackathon?.status || "").toLowerCase();
    if (normalized === "ongoing") return "active";
    if (normalized === "upcoming") return "upcoming";
    if (normalized === "ended") return "ended";
    if (normalized === "cancelled") return "cancelled";

    const now = new Date();
    const startDate = new Date(hackathon.startDate);
    const endDate = new Date(hackathon.endDate);
    if (endDate < now) return "ended";
    if (startDate <= now && endDate >= now) return "active";
    return "upcoming";
  }, []);

  const resolveCoordinatesForLocation = useCallback(async (location) => {
    const key = normalizeLocation(location);
    if (!key) return null;
    if (geocodeCacheRef.current.has(key)) return geocodeCacheRef.current.get(key);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(location)}`
      );
      if (!response.ok) {
        geocodeCacheRef.current.set(key, null);
        return null;
      }

      const results = await response.json();
      const first = Array.isArray(results) ? results[0] : null;
      const resolved =
        first && Number.isFinite(Number(first.lat)) && Number.isFinite(Number(first.lon))
          ? { latitude: Number(first.lat), longitude: Number(first.lon) }
          : null;

      geocodeCacheRef.current.set(key, resolved);
      return resolved;
    } catch {
      geocodeCacheRef.current.set(key, null);
      return null;
    }
  }, []);

  const enrichHackathonsWithCoordinates = useCallback(
    async (items) => {
      const missingLocations = [
        ...new Set(
          items
            .filter((item) => !hasValidCoordinates(item) && item.location)
            .map((item) => item.location)
        )
      ];

      const resolvedPairs = await Promise.all(
        missingLocations.map(async (location) => [location, await resolveCoordinatesForLocation(location)])
      );
      const resolvedMap = new Map(
        resolvedPairs.map(([location, coords]) => [normalizeLocation(location), coords])
      );

      return items.map((item) => {
        if (hasValidCoordinates(item)) {
          return {
            ...item,
            latitude: Number(item.latitude),
            longitude: Number(item.longitude)
          };
        }

        const resolved = resolvedMap.get(normalizeLocation(item.location));
        return resolved
          ? { ...item, latitude: resolved.latitude, longitude: resolved.longitude }
          : item;
      });
    },
    [resolveCoordinatesForLocation]
  );

  const loadHackathons = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await apiClient.getHackathons({ limit: 250 });
      const rawHackathons = response.hackathons || [];
      const enrichedHackathons = await enrichHackathonsWithCoordinates(rawHackathons);
      setHackathons(enrichedHackathons);
    } catch (err) {
      setHackathons([]);
      setError(err.message || "Failed to load hackathons");
    } finally {
      setLoading(false);
    }
  }, [enrichHackathonsWithCoordinates]);

  useEffect(() => {
    loadHackathons();
  }, [loadHackathons]);

  useRealtimeStream({
    "hackathon:created": loadHackathons,
    "hackathon:updated": loadHackathons,
    "hackathon:deleted": loadHackathons,
    "hackathon:approval-updated": loadHackathons
  });

  useEffect(() => {
    const locations = [...new Set(hackathons.map((h) => h.location).filter(Boolean))].sort((a, b) =>
      a.localeCompare(b)
    );
    setAvailableLocations(locations);
  }, [hackathons]);

  useEffect(() => {
    const locationTerm = normalizeLocation(searchLocation);
    const filtered = hackathons.filter((hackathon) => {
      const locationHaystack = normalizeLocation(
        `${hackathon.location || ""} ${hackathon.address || ""}`
      );
      const status = getHackathonStatus(hackathon);
      const matchesLocation = !locationTerm || locationHaystack.includes(locationTerm);
      const matchesStatus = selectedStatus === "all" || status === selectedStatus;
      return matchesLocation && matchesStatus;
    });
    setFilteredHackathons(filtered);
  }, [hackathons, searchLocation, selectedStatus, getHackathonStatus]);

  const locationGroups = useMemo(() => {
    const groups = new Map();
    filteredHackathons
      .filter(hasValidCoordinates)
      .forEach((hackathon) => {
        const key = normalizeLocation(hackathon.location || "");
        if (!key) return;

        if (!groups.has(key)) {
          groups.set(key, {
            key,
            location: hackathon.location || "Unknown location",
            items: [],
            latitudes: [],
            longitudes: [],
            statusCounts: { active: 0, upcoming: 0, ended: 0, cancelled: 0 }
          });
        }

        const group = groups.get(key);
        const status = getHackathonStatus(hackathon);
        group.items.push(hackathon);
        group.latitudes.push(Number(hackathon.latitude));
        group.longitudes.push(Number(hackathon.longitude));
        if (group.statusCounts[status] !== undefined) {
          group.statusCounts[status] += 1;
        }
      });

    return Array.from(groups.values()).map((group) => ({
      ...group,
      count: group.items.length,
      latitude: group.latitudes.reduce((sum, value) => sum + value, 0) / group.latitudes.length,
      longitude: group.longitudes.reduce((sum, value) => sum + value, 0) / group.longitudes.length
    }));
  }, [filteredHackathons, getHackathonStatus]);

  const locationGroupsWithOffset = useMemo(() => {
    const buckets = new Map();

    locationGroups.forEach((group) => {
      const key = toCoordBucket(group.latitude, group.longitude);
      if (!buckets.has(key)) {
        buckets.set(key, []);
      }
      buckets.get(key).push(group);
    });

    return locationGroups.map((group) => {
      const bucketKey = toCoordBucket(group.latitude, group.longitude);
      const bucket = buckets.get(bucketKey) || [];
      const index = bucket.findIndex((item) => item.key === group.key);

      if (bucket.length <= 1 || index < 0) {
        return {
          ...group,
          displayLatitude: group.latitude,
          displayLongitude: group.longitude
        };
      }

      const ringRadius = 0.12;
      const angle = (2 * Math.PI * index) / bucket.length;
      const latitudeOffset = ringRadius * Math.cos(angle);
      const longitudeOffset =
        (ringRadius * Math.sin(angle)) / Math.max(Math.cos((group.latitude * Math.PI) / 180), 0.2);

      return {
        ...group,
        displayLatitude: group.latitude + latitudeOffset,
        displayLongitude: group.longitude + longitudeOffset
      };
    });
  }, [locationGroups]);

  const maxCount = useMemo(
    () => Math.max(1, ...locationGroups.map((group) => group.count)),
    [locationGroups]
  );

  const getHeatColor = useCallback(
    (count) => {
      const ratio = Math.min(1, count / maxCount);
      if (ratio > 0.7) return "#dc2626";
      if (ratio > 0.4) return "#f97316";
      if (ratio > 0.2) return "#facc15";
      return "#22c55e";
    },
    [maxCount]
  );

  useEffect(() => {
    if (mapInstance.current) {
      mapInstance.current.remove();
      mapInstance.current = null;
    }
    markersRef.current = [];
    if (!mapRef.current) return undefined;

    mapInstance.current = L.map(mapRef.current).setView([20, 0], 2);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 19
    }).addTo(mapInstance.current);

    if (!locationGroupsWithOffset.length) return undefined;

    const bounds = [];
    locationGroupsWithOffset.forEach((group) => {
      const heatColor = getHeatColor(group.count);
      const radius = 14 + Math.min(22, group.count * 3);
      const circle = L.circleMarker([group.displayLatitude, group.displayLongitude], {
        radius,
        color: "#ffffff",
        weight: 2,
        fillColor: heatColor,
        fillOpacity: 0.75
      }).addTo(mapInstance.current);

      const statusLine = `Active: ${group.statusCounts.active} | Upcoming: ${group.statusCounts.upcoming} | Ended: ${group.statusCounts.ended}`;
      circle.bindPopup(
        `<div class="font-sans p-2">
          <h4 class="font-bold text-sm mb-1">${group.location}</h4>
          <p class="text-xs text-gray-600">${group.count} hackathon(s)</p>
          <p class="text-xs text-gray-500 mt-1">${statusLine}</p>
          <p class="text-xs text-indigo-600 mt-2">Click this heat dot to open all hackathons for this location.</p>
        </div>`
      );

      circle.on("click", () => {
        navigate(`/dashboard/user?section=browse&location=${encodeURIComponent(group.location)}`);
      });

      bounds.push([group.displayLatitude, group.displayLongitude]);
      markersRef.current.push(circle);
    });

    if (bounds.length === 1) {
      mapInstance.current.setView(bounds[0], 6);
    } else {
      mapInstance.current.fitBounds(L.latLngBounds(bounds), { padding: [30, 30], maxZoom: 12 });
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
      markersRef.current = [];
    };
  }, [getHeatColor, locationGroupsWithOffset, navigate]);

  const submitLocationSearch = () => {
    setSearchLocation(searchLocationDraft.trim());
  };

  const clearLocationSearch = () => {
    setSearchLocation("");
    setSearchLocationDraft("");
  };

  if (loading) {
    return (
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
        <div className="h-96 w-full rounded-2xl bg-slate-100 flex items-center justify-center">
          <p className="text-slate-500">Loading hackathons map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
      <div>
        <h3 className="text-2xl font-bold text-slate-950">Track Hackathons</h3>
        <p className="mt-2 text-sm text-slate-600">
          Real-time location heat map. Click a location dot to open all hackathons from that location.
        </p>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Search size={16} className="text-slate-600" />
          <label className="text-sm font-semibold text-slate-700">Filter by Location</label>
        </div>
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search location..."
                value={searchLocationDraft}
                onChange={(e) => setSearchLocationDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") submitLocationSearch();
                }}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {searchLocationDraft && (
                <button
                  onClick={clearLocationSearch}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <button
              onClick={submitLocationSearch}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Search
            </button>
          </div>

          {availableLocations.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={clearLocationSearch}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                  searchLocation === ""
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-100"
                }`}
              >
                All Locations
              </button>
              {availableLocations.map((location) => (
                <button
                  key={location}
                  onClick={() => {
                    setSearchLocationDraft(location);
                    setSearchLocation(location);
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                    normalizeLocation(searchLocation) === normalizeLocation(location)
                      ? "bg-blue-600 text-white"
                      : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {location}
                </button>
              ))}
            </div>
          )}

          <div>
            <label className="text-sm font-semibold text-slate-700">Filter by Status</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition ${
                    selectedStatus === status
                      ? "bg-slate-900 text-white"
                      : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 rounded-2xl bg-slate-50 p-4 text-xs font-semibold text-slate-700">
        <div className="inline-flex items-center gap-2">
          <Flame size={14} className="text-green-500" />
          Low Density
        </div>
        <div className="inline-flex items-center gap-2">
          <Flame size={14} className="text-yellow-500" />
          Medium Density
        </div>
        <div className="inline-flex items-center gap-2">
          <Flame size={14} className="text-orange-500" />
          High Density
        </div>
        <div className="inline-flex items-center gap-2">
          <Flame size={14} className="text-red-600" />
          Very High Density
        </div>
      </div>

      {locationGroups.length > 0 ? (
        <div
          ref={mapRef}
          className="h-96 w-full rounded-2xl border border-slate-200"
          style={{ background: "#f0f0f0" }}
        />
      ) : (
        <div className="h-96 w-full rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="mx-auto h-8 w-8 text-slate-400 mb-2" />
            <p className="text-slate-500 text-sm">No hackathons found with location data for this filter</p>
          </div>
        </div>
      )}

      {filteredHackathons.length === 0 && !error && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center">
          <MapPin className="mx-auto h-8 w-8 text-slate-400 mb-2" />
          <p className="text-slate-500">No hackathons found for this filter</p>
        </div>
      )}
    </div>
  );
};

export default HackathonTrackingMap;
