import { useEffect, useState } from "react";
import { apiClient } from "../api/client";
import { useRealtimeStream } from "./useRealtimeStream";

export function useHackathons({ searchTerm = "", status = "", type = "" }) {
  const [hackathons, setHackathons] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useRealtimeStream({
    "hackathon:created": () => setReloadKey((value) => value + 1),
    "hackathon:updated": () => setReloadKey((value) => value + 1),
    "hackathon:deleted": () => setReloadKey((value) => value + 1),
    "hackathon:approval-updated": () => setReloadKey((value) => value + 1),
    "registration:created": () => setReloadKey((value) => value + 1),
    "registration:deleted": () => setReloadKey((value) => value + 1)
  });

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.getHackathons({
          search: searchTerm,
          status,
          type
        });

        if (!active) return;
        setHackathons(response.hackathons || []);
        setTotal(response.total || 0);
      } catch (err) {
        if (!active) return;
        setError(err.message || "Failed to load hackathons.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [reloadKey, searchTerm, status, type]);

  return { hackathons, total, loading, error };
}

export function useHackathon(id) {
  const [hackathon, setHackathon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.getHackathon(id);
        if (!active) return;
        setHackathon(response);
      } catch (err) {
        if (!active) return;
        setError(err.message || "Failed to load hackathon.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    if (id) {
      load();
    }

    return () => {
      active = false;
    };
  }, [id]);

  return { hackathon, loading, error };
}

export function useHackathonStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useRealtimeStream({
    "hackathon:created": () => setReloadKey((value) => value + 1),
    "hackathon:updated": () => setReloadKey((value) => value + 1),
    "hackathon:deleted": () => setReloadKey((value) => value + 1),
    "hackathon:approval-updated": () => setReloadKey((value) => value + 1)
  });

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.getHackathonStats();
        if (!active) return;
        setStats(response);
      } catch (err) {
        if (!active) return;
        setError(err.message || "Failed to load stats.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [reloadKey]);

  return { stats, loading, error };
}
