import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Users, Activity, Heart, AlertTriangle, Clock, TrendingUp,
  BarChart3, MapPin, Trophy, Droplets
} from "lucide-react";

interface DonorRow {
  id: string;
  full_name: string;
  blood_group: string;
  batch_session: string;
  available_now: boolean;
  created_at: string;
}

interface RequestRow {
  id: string;
  blood_group: string;
  urgency_level: string;
  status: string;
  current_area: string | null;
  created_at: string;
  solved_at: string | null;
}

interface DonationRow {
  id: string;
  donor_id: string;
  blood_group: string;
  donation_date: string;
  units_donated: number;
  created_at: string;
}

const timeAgo = (date: string) => {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const DashboardPage = () => {
  const [donors, setDonors] = useState<DonorRow[]>([]);
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [donations, setDonations] = useState<DonationRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [d, r, dn] = await Promise.all([
        supabase.from("donors").select("id, full_name, blood_group, batch_session, available_now, created_at").order("created_at", { ascending: false }),
        supabase.from("emergency_requests").select("id, blood_group, urgency_level, status, current_area, created_at, solved_at").order("created_at", { ascending: false }),
        supabase.from("donations").select("id, donor_id, blood_group, donation_date, units_donated, created_at").order("donation_date", { ascending: false }),
      ]);
      if (d.data) setDonors(d.data as unknown as DonorRow[]);
      if (r.data) setRequests(r.data as unknown as RequestRow[]);
      if (dn.data) setDonations(dn.data as unknown as DonationRow[]);
      setLoading(false);
    };
    load();
  }, []);

  // KPI computations
  const totalDonors = donors.length;
  const activeDonors = donors.filter((d) => d.available_now).length;
  const activeRequests = requests.filter((r) => r.status === "active").length;
  const solvedRequests = requests.filter((r) => r.status === "solved").length;
  const totalDonations = donations.length;

  // Most requested blood group
  const mostRequested = useMemo(() => {
    const counts: Record<string, number> = {};
    requests.forEach((r) => { counts[r.blood_group] = (counts[r.blood_group] || 0) + 1; });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return sorted[0] || ["—", 0];
  }, [requests]);

  // Rare blood shortage (rare groups with low donor count)
  const rareGroups = ["O-", "A-", "B-", "AB-"];
  const rareDonorCounts = useMemo(() => {
    return rareGroups.map((g) => ({
      group: g,
      count: donors.filter((d) => d.blood_group === g).length,
      requested: requests.filter((r) => r.blood_group === g).length,
    })).sort((a, b) => a.count - b.count);
  }, [donors, requests]);

  // Donors by batch
  const donorsByBatch = useMemo(() => {
    const counts: Record<string, number> = {};
    donors.forEach((d) => { counts[d.batch_session] = (counts[d.batch_session] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [donors]);

  // Solved within 1 hour %
  const solvedWithin1h = useMemo(() => {
    const solved = requests.filter((r) => r.status === "solved" && r.solved_at);
    if (solved.length === 0) return 0;
    const fast = solved.filter((r) => {
      const diff = new Date(r.solved_at!).getTime() - new Date(r.created_at).getTime();
      return diff <= 3600000; // 1 hour
    });
    return Math.round((fast.length / solved.length) * 100);
  }, [requests]);

  // Last 7 day request trend
  const last7DaysTrend = useMemo(() => {
    const days: { label: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStr = date.toISOString().split("T")[0];
      const label = date.toLocaleDateString("en-US", { weekday: "short" });
      const count = requests.filter((r) => r.created_at.startsWith(dayStr)).length;
      days.push({ label, count });
    }
    return days;
  }, [requests]);
  const maxTrend = Math.max(...last7DaysTrend.map((d) => d.count), 1);

  // Emergency hotspots
  const hotspots = useMemo(() => {
    const counts: Record<string, number> = {};
    requests.filter((r) => r.current_area).forEach((r) => {
      counts[r.current_area!] = (counts[r.current_area!] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [requests]);

  // Top donors (by donation count)
  const topDonors = useMemo(() => {
    const counts: Record<string, { name: string; count: number; units: number }> = {};
    donations.forEach((d) => {
      if (!counts[d.donor_id]) {
        const donor = donors.find((dn) => dn.id === d.donor_id);
        counts[d.donor_id] = { name: donor?.full_name || "Unknown", count: 0, units: 0 };
      }
      counts[d.donor_id].count++;
      counts[d.donor_id].units += d.units_donated;
    });
    return Object.entries(counts)
      .map(([id, v]) => ({ id, ...v }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [donations, donors]);

  // Recent donation timeline
  const recentDonations = donations.slice(0, 5);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-7xl mx-auto px-6 pt-24 pb-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-card rounded-2xl p-6 animate-pulse">
                <div className="h-4 bg-muted rounded w-1/2 mb-3" />
                <div className="h-8 bg-muted rounded w-1/3" />
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-12">
        {/* Header */}
        <section className="mb-8">
          <meta name="robots" content="noindex, nofollow" />
          <h1 className="font-headline text-3xl sm:text-4xl lg:text-5xl font-bold text-primary tracking-tight italic mb-2">
            Admin Console
          </h1>
          <p className="font-headline italic text-muted-foreground">
            Live insights from the Crimson Verse community.
          </p>
        </section>

        {/* Primary KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
          {[
            { icon: <Users className="h-5 w-5" />, label: "Total Donors", value: totalDonors, sub: `${activeDonors} active` },
            { icon: <Activity className="h-5 w-5" />, label: "Active Requests", value: activeRequests, sub: `${solvedRequests} solved` },
            { icon: <Heart className="h-5 w-5" />, label: "Total Donations", value: totalDonations, sub: `${donations.reduce((s, d) => s + d.units_donated, 0)} units` },
            { icon: <Clock className="h-5 w-5" />, label: "Solved < 1hr", value: `${solvedWithin1h}%`, sub: "response rate" },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-card rounded-2xl p-5 shadow-ambient">
              <div className="text-primary mb-2">{kpi.icon}</div>
              <p className="font-headline text-2xl sm:text-3xl font-bold text-foreground">{kpi.value}</p>
              <p className="font-body text-[10px] uppercase tracking-widest text-muted-foreground font-bold mt-1">{kpi.label}</p>
              <p className="font-body text-xs text-muted-foreground mt-0.5">{kpi.sub}</p>
            </div>
          ))}
        </div>

        {/* Second row: Most requested + Rare shortage */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          {/* Most requested blood group */}
          <div className="bg-card rounded-2xl p-6 shadow-ambient">
            <div className="flex items-center gap-2 mb-4">
              <Droplets className="h-5 w-5 text-primary" />
              <h3 className="font-headline text-lg font-bold italic text-foreground">Most Requested</h3>
            </div>
            <div className="flex items-end gap-4">
              <span className="bg-primary text-primary-foreground text-3xl font-headline font-bold px-4 py-2 rounded-xl">
                {mostRequested[0]}
              </span>
              <div>
                <p className="font-body text-sm text-foreground font-bold">{mostRequested[1]} requests</p>
                <p className="font-body text-xs text-muted-foreground">All time most needed blood group</p>
              </div>
            </div>

            {/* All blood group request distribution */}
            <div className="mt-5 space-y-2">
              {(() => {
                const counts: Record<string, number> = {};
                requests.forEach((r) => { counts[r.blood_group] = (counts[r.blood_group] || 0) + 1; });
                const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
                const max = sorted[0]?.[1] || 1;
                return sorted.map(([group, count]) => (
                  <div key={group} className="flex items-center gap-3">
                    <span className="w-10 font-body text-xs font-bold text-foreground">{group}</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(count / max) * 100}%` }} />
                    </div>
                    <span className="font-body text-xs text-muted-foreground w-6 text-right">{count}</span>
                  </div>
                ));
              })()}
            </div>
          </div>

          {/* Rare blood shortage */}
          <div className="bg-card rounded-2xl p-6 shadow-ambient">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-primary" />
              <h3 className="font-headline text-lg font-bold italic text-foreground">Rare Blood Shortage</h3>
            </div>
            <div className="space-y-3">
              {rareDonorCounts.map((r) => (
                <div key={r.group} className="flex items-center justify-between bg-background rounded-xl px-4 py-3 shadow-ambient">
                  <div className="flex items-center gap-3">
                    <span className="bg-primary text-primary-foreground text-sm font-body font-bold px-2.5 py-0.5 rounded">{r.group}</span>
                    <div>
                      <p className="font-body text-sm font-bold text-foreground">{r.count} donors</p>
                      <p className="font-body text-xs text-muted-foreground">{r.requested} times requested</p>
                    </div>
                  </div>
                  {r.count < 3 && (
                    <span className="text-[10px] font-body font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-1 rounded-full">
                      Critical
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Third row: 7-day trend + Donors by batch */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          {/* 7-day request trend */}
          <div className="bg-card rounded-2xl p-6 shadow-ambient">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h3 className="font-headline text-lg font-bold italic text-foreground">Last 7 Days</h3>
            </div>
            <div className="flex items-end gap-2 h-32">
              {last7DaysTrend.map((day) => (
                <div key={day.label} className="flex-1 flex flex-col items-center gap-1">
                  <span className="font-body text-[10px] font-bold text-muted-foreground">{day.count}</span>
                  <div className="w-full bg-muted rounded-t-lg overflow-hidden flex-1 flex items-end">
                    <div
                      className="w-full bg-primary rounded-t-lg transition-all"
                      style={{ height: `${(day.count / maxTrend) * 100}%`, minHeight: day.count > 0 ? "4px" : "0" }}
                    />
                  </div>
                  <span className="font-body text-[10px] text-muted-foreground">{day.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Donors by batch */}
          <div className="bg-card rounded-2xl p-6 shadow-ambient">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="h-5 w-5 text-primary" />
              <h3 className="font-headline text-lg font-bold italic text-foreground">Donors by Batch</h3>
            </div>
            <div className="space-y-2">
              {donorsByBatch.length === 0 ? (
                <p className="font-body text-sm text-muted-foreground">No data yet.</p>
              ) : (
                donorsByBatch.map(([batch, count]) => (
                  <div key={batch} className="flex items-center gap-3">
                    <span className="w-20 font-body text-xs font-bold text-foreground truncate">{batch}</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${(count / (donorsByBatch[0]?.[1] || 1)) * 100}%` }}
                      />
                    </div>
                    <span className="font-body text-xs text-muted-foreground w-6 text-right">{count}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Fourth row: Hotspots + Top donors + Recent donations */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Emergency hotspots */}
          <div className="bg-card rounded-2xl p-6 shadow-ambient">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-5 w-5 text-primary" />
              <h3 className="font-headline text-lg font-bold italic text-foreground">Hotspots</h3>
            </div>
            {hotspots.length === 0 ? (
              <p className="font-body text-sm text-muted-foreground">No area data yet.</p>
            ) : (
              <div className="space-y-3">
                {hotspots.map(([area, count], i) => (
                  <div key={area} className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-[10px] font-body font-bold text-primary">
                      {i + 1}
                    </span>
                    <span className="font-body text-sm text-foreground flex-1 truncate">{area}</span>
                    <span className="font-body text-xs text-muted-foreground">{count} req</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top donor leaderboard */}
          <div className="bg-card rounded-2xl p-6 shadow-ambient">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="h-5 w-5 text-primary" />
              <h3 className="font-headline text-lg font-bold italic text-foreground">Top Donors</h3>
            </div>
            {topDonors.length === 0 ? (
              <p className="font-body text-sm text-muted-foreground">No donations recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {topDonors.map((d, i) => (
                  <div key={d.id} className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-body ${
                      i === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}>
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-body text-sm font-bold text-foreground truncate">{d.name}</p>
                      <p className="font-body text-xs text-muted-foreground">{d.units} units</p>
                    </div>
                    <span className="font-body text-xs font-bold text-primary">{d.count}×</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent donation timeline */}
          <div className="bg-card rounded-2xl p-6 shadow-ambient">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="h-5 w-5 text-primary" />
              <h3 className="font-headline text-lg font-bold italic text-foreground">Recent Donations</h3>
            </div>
            {recentDonations.length === 0 ? (
              <p className="font-body text-sm text-muted-foreground">No donations yet.</p>
            ) : (
              <div className="space-y-3">
                {recentDonations.map((d) => {
                  const donor = donors.find((dn) => dn.id === d.donor_id);
                  return (
                    <div key={d.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-headline text-sm font-bold flex-shrink-0">
                        {donor?.full_name.charAt(0) || "?"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-body text-sm font-bold text-foreground truncate">
                          {donor?.full_name || "Unknown"}
                        </p>
                        <p className="font-body text-xs text-muted-foreground">
                          {d.blood_group} • {d.units_donated}u • {timeAgo(d.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DashboardPage;
