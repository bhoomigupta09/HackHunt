import { useState, useEffect } from "react";
import { hackathons as staticHackathons } from "../data/hackathons";

/* =========================
   LIST OF HACKATHONS
========================= */
export function useHackathons({ searchTerm = "", status = "", type = "" }) {
  const [hackathons, setHackathons] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    // fake API delay
    setTimeout(() => {
   let filteredHackathons = [...staticHackathons];

// 🔍 search
if (searchTerm) {
  filteredHackathons = filteredHackathons.filter((h) =>
    h.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
}

// 🏷 status filter
if (status) {
  filteredHackathons = filteredHackathons.filter(
    (h) => h.status === status
  );
}

// 📌 type filter
if (type) {
  filteredHackathons = filteredHackathons.filter(
    (h) => h.type === type
  );
}

setHackathons(filteredHackathons);
setTotal(filteredHackathons.length);
setLoading(false);
    }, 400);
 }, [searchTerm, status, type]);

  return { hackathons, total, loading, error };
}

/* =========================
   SINGLE HACKATHON
========================= */
export function useHackathon(id) {
  const [hackathon, setHackathon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const foundHackathon =
      staticHackathons.find((h) => h.id === id) || null;

    setTimeout(() => {
      setHackathon(foundHackathon);
      setLoading(false);
    }, 300);
  }, [id]);

  return { hackathon, loading, error };
}

/* =========================
   HACKATHON STATS
========================= */
export function useHackathonStats() {
  const stats = {
    total: staticHackathons.length,
    ongoing: staticHackathons.filter((h) => h.status === "ongoing").length,
    upcoming: staticHackathons.filter((h) => h.status === "upcoming").length,
  };

  return { stats, loading: false, error: null };
}
