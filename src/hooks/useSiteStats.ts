import { useEffect, useState, useRef, useCallback } from "react";
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

  const fetchStats = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchStats();

    // Use unique channel names with random suffix to avoid strict mode collision
    const id = Math.random().toString(36).slice(2, 8);

    let ch1: ReturnType<typeof supabase.channel> | null = null;
    let ch2: ReturnType<typeof supabase.channel> | null = null;

    try {
      ch1 = supabase
        .channel(`stats-donors-${id}`)
        .on("postgres_changes", { event: "*", schema: "public", table: "donors" }, () => fetchStats())
        .subscribe();

      ch2 = supabase
        .channel(`stats-requests-${id}`)
        .on("postgres_changes", { event: "*", schema: "public", table: "emergency_requests" }, () => fetchStats())
        .subscribe();
    } catch {
      // Ignore channel setup errors
    }

    return () => {
      mountedRef.current = false;
      if (ch1) supabase.removeChannel(ch1);
      if (ch2) supabase.removeChannel(ch2);
    };
  }, [fetchStats]);

  return { stats, loading };
}
