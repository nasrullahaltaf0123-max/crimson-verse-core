import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SiteStats {
  total_donors: number;
  active_requests: number;
  rare_blood_count: number;
  successful_matches: number;
}

const defaultStats: SiteStats = {
  total_donors: 0,
  active_requests: 0,
  rare_blood_count: 0,
  successful_matches: 0,
};

export function useSiteStats() {
  const [stats, setStats] = useState<SiteStats>(defaultStats);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from("site_stats")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (!mountedRef.current) return;

      if (data && !error) {
        setStats({
          total_donors: data.total_donors ?? 0,
          active_requests: data.active_requests ?? 0,
          rare_blood_count: data.rare_blood_count ?? 0,
          successful_matches: data.successful_matches ?? 0,
        });
      }
    } catch {
      // Silently fallback to defaults
    }
    if (mountedRef.current) setLoading(false);
  };

  useEffect(() => {
    mountedRef.current = true;
    fetchStats();

    const ch1 = supabase
      .channel("stats-donors")
      .on("postgres_changes", { event: "*", schema: "public", table: "donors" }, () => fetchStats())
      .subscribe();

    const ch2 = supabase
      .channel("stats-requests")
      .on("postgres_changes", { event: "*", schema: "public", table: "emergency_requests" }, () => fetchStats())
      .subscribe();

    return () => {
      mountedRef.current = false;
      supabase.removeChannel(ch1);
      supabase.removeChannel(ch2);
    };
  }, []);

  return { stats, loading };
}
