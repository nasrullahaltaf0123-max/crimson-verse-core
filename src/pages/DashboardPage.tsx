import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Users, Activity, Heart, AlertTriangle, Clock, TrendingUp,
  BarChart3, MapPin, Trophy, Droplets, CheckCircle, XCircle, ShieldAlert
} from "lucide-react";
import { toast } from "sonner";

interface DonorRow {
  id: string;
  full_name: string;
  blood_group: string;
  batch_session: string;
  phone: string;
  available_now: boolean;
  created_at: string;
  approval_status: string;
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
  const [activeTab, setActiveTab] = useState<"overview" | "pending">("overview");

  // noindex for admin page
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    return () => { document.head.removeChild(meta); };
  }, []);

  const loadData = async () => {
    const [d, r, dn] = await Promise.all([
      supabase.from("donors").select("id, full_name, blood_group, batch_session, phone, available_now, created_at, approval_status").order("created_at", { ascending: false }),
      supabase.from("emergency_requests").select("id, blood_group, urgency_level, status, current_area, created_at, solved_at").order("created_at", { ascending: false }),
      supabase.from("donations").select("id, donor_id, blood_group, donation_date, units_donated, created_at").order("donation_date", { ascending: false }),
    ]);
    if (d.data) setDonors(d.data as unknown as DonorRow[]);
    if (r.data) setRequests(r.data as unknown as RequestRow[]);
    if (dn.data) setDonations(dn.data as unknown as DonationRow[]);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleApproval = async (donorId: string, status: "approved" | "rejected") => {
    const { error } = await supabase.from("donors").update({ approval_status: status }).eq("id", donorId);
    if (error) {
      toast.error(`Failed to ${status} donor.`, { description: error.message });
      return;
    }
    toast.success(status === "approved" ? "Donor approved! ✓" : "Donor rejected.");
    setDonors((prev) => prev.map((d) => d.id === donorId ? { ...d, approval_status: status } : d));
  };

  // Only count approved donors for KPIs
  const approvedDonors = donors.filter((d) => d.approval_status === "approved");
  const pendingDonors = donors.filter((d) => d.approval_status === "pending");
  const totalDonors = approvedDonors.length;
  const activeDonors = approvedDonors.filter((d) => d.available_now).length;
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

  // Rare blood shortage
  const rareGroups = ["O-", "A-", "B-", "AB-"];
  const rareDonorCounts = useMemo(() => {
    return rareGroups.map((g) => ({
      group: g,
      count: approvedDonors.filter((d) => d.blood_group === g).length,
      requested: requests.filter((r) => r.blood_group === g).length,
    })).sort((a, b) => a.count - b.count);
  }, [approvedDonors, requests]);

  // Donors by batch (approved only)
  const donorsByBatch = useMemo(() => {
    const counts: Record<string, number> = {};
    approvedDonors.forEach((d) => { counts[d.batch_session] = (counts[d.batch_session] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [approvedDonors]);

  // Solved within 1 hour %
  const solvedWithin1h = useMemo(() => {
    const solved = requests.filter((r) => r.status === "solved" && r.solved_at);
    if (solved.length === 0) return 0;
    const fast = solved.filter((r) => {
      const diff = new Date(r.solved_at!).getTime() - new Date(r.created_at).getTime();
      return diff <= 3600000;
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

  // Top donors (by donation count, approved only)
  const topDonors = useMemo(() => {
    const counts: Record<string, { name: string; count: number; units: number }> = {};
    donations.forEach((d) => {
      const donor = approvedDonors.find((dn) => dn.id === d.donor_id);
      if (!donor) return;
      if (!counts[d.donor_id]) {
        counts[d.donor_id] = { name: donor.full_name, count: 0, units: 0 };
      }
      counts[d.donor_id].count++;
      counts[d.donor_id].units += d.units_donated;
    });
    return Object.entries(counts)
      .map(([id, v]) => ({ id, ...v }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [donations, approvedDonors]);

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
          <h1 className="font-headline text-3xl sm:text-4xl lg:text-5xl font-bold text-primary tracking-tight italic mb-2">
            Admin Console
          </h1>
          <p className="font-headline italic text-muted-foreground">
            Live insights from the Crimson Verse community.
          </p>
        </section>

        {/* Tab switcher */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-5 py-2.5 rounded-xl font-body text-sm font-bold transition-all ${
              activeTab === "overview" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-5 py-2.5 rounded-xl font-body text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === "pending" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted"
            }`}
          >
            <ShieldAlert className="h-4 w-4" />
            Pending Approval
            {pendingDonors.length > 0 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                activeTab === "pending" ? "bg-primary-foreground text-primary" : "bg-primary text-primary-foreground"
              }`}>
                {pendingDonors.length}
              </span>
            )}
          </button>
        </div>

        {activeTab === "pending" ? (
          /* ═══ PENDING APPROVAL TAB ═══ */
          <section>
            {pendingDonors.length === 0 ? (
              <div className="text-center py-20 bg-card rounded-2xl shadow-ambient">
                <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4 opacity-40" />
                <p className="font-headline text-xl italic text-muted-foreground">All clear</p>
                <p className="font-body text-sm text-muted-foreground mt-1">No pending donor submissions.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingDonors.map((d) => (
                  <div key={d.id} className="bg-card rounded-2xl p-5 shadow-ambient flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-headline font-bold flex-shrink-0">
                        {d.full_name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-body text-sm font-bold text-foreground truncate">{d.full_name}</p>
                        <p className="font-body text-xs text-muted-foreground">
                          {d.blood_group} • {d.batch_session} • {d.phone} • {timeAgo(d.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleApproval(d.id, "approved")}
                        className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-xl font-body text-xs font-bold active:scale-95 transition-all"
                      >
                        <CheckCircle className="h-3.5 w-3.5" /> Approve
                      </button>
                      <button
                        onClick={() => handleApproval(d.id, "rejected")}
                        className="flex items-center gap-1.5 px-4 py-2 bg-muted text-muted-foreground rounded-xl font-body text-xs font-bold active:scale-95 transition-all hover:bg-destructive/10 hover:text-destructive"
                      >
                        <XCircle className="h-3.5 w-3.5" /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        ) : (
          /* ═══ OVERVIEW TAB ═══ */
          <>
            {/* Primary KPI cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
              {[
                { icon: <Users className="h-5 w-5" />, label: "Approved Donors", value: totalDonors, sub: `${activeDonors} active` },
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

            {/* Pending alert banner */}
            {pendingDonors.length > 0 && (
              <button
                onClick={() => setActiveTab("pending")}
                className="w-full mb-8 flex items-center gap-3 bg-primary/10 border border-primary/20 rounded-2xl p-4 text-left hover:bg-primary/15 transition-colors"
              >
                <ShieldAlert className="h-5 w-5 text-primary flex-shrink-0" />
                <div>
                  <p className="font-body text-sm font-bold text-foreground">{pendingDonors.length} donor{pendingDonors.length > 1 ? "s" : ""} awaiting approval</p>
                  <p className="font-body text-xs text-muted-foreground">Tap to review and approve</p>
                </div>
              </button>
            )}

            {/* Second row: Most requested + Rare shortage */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
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

              <div className="bg-card rounded-2xl p-6 shadow-ambient">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <h3 className="font-headline text-lg font-bold italic text-foreground">Donors by Batch</h3>
                </div>
                <div className="space-y-2">
                  {donorsByBatch.length === 0 ? (
                    <p className="font-body text-sm text-muted-foreground">No approved donors yet.</p>
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
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default DashboardPage;
