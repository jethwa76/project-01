import { useEffect, useState } from "react";
import api from "../api/client";

export function useApiResource(path, fallback = []) {
  const [data, setData] = useState(fallback);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const response = await api.get(path);
        if (mounted) setData(response.data.data || response.data);
      } catch (err) {
        if (mounted) setError(err.message || "Unable to load resource.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [path]);

  return { data, setData, loading, error };
}
