import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { waLink, normalizeBDPhone } from "@/lib/phoneUtils";
import {
  Users, Activity, Heart, AlertTriangle, Clock, TrendingUp,
  BarChart3, MapPin, Trophy, Droplets, CheckCircle, XCircle, ShieldAlert,
  Phone, MessageCircle, Download, Trash2, Eye, EyeOff, Search,
  ChevronDown, ChevronUp, Star, Flag, Archive, Send, Edit3, X
} from "lucide-react";
import { toast } from "sonner";

/* ════════ Types ════════ */

interface DonorRow {
  id: string;
  full_name: string;
  blood_group: string;
  batch_session: string;
  phone: string;
  email: string | null;
  gender: string;
  available_now: boolean;
  created_at: string;
  approval_status: string;
  current_area: string | null;
  hall_hostel: string | null;
  weight: string | null;
  health_notes: string | null;
  last_donation_date: string | null;
  student_roll: string | null;
  year_semester: string | null;
  facebook_link: string | null;
  donor_status: string | null;
}

interface RequestRow {
  id: string;
  patient_name: string;
  blood_group: string;
  units_needed: number;
  hospital: string;
  contact_number: string;
  urgency_level: string;
  status: string;
  current_area: string | null;
  created_at: string;
  solved_at: string | null;
  notes: string | null;
  ward_cabin: string | null;
  is_pinned: boolean | null;
}

interface DonationRow {
  id: string;
  donor_id: string;
  blood_group: string;
  donation_date: string;
  units_donated: number;
  created_at: string;
  patient_name: string | null;
  hospital: string | null;
}

type AdminTab = "overview" | "pending" | "donors" | "requests" | "donations";

/* ════════ Helpers ════════ */

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

const formatDate = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

const exportCSV = (rows: Record<string, unknown>[], filename: string) => {
  if (rows.length === 0) { toast.error("Nothing to export"); return; }
  const headers = Object.keys(rows[0]);
  const csv = [headers.join(","), ...rows.map(r => headers.map(h => `"${String(r[h] ?? "").replace(/"/g, '""')}"`).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
  toast.success(`Exported ${rows.length} rows`);
};

/* ════════ Component ════════ */

const DashboardPage = () => {
  const [donors, setDonors] = useState<DonorRow[]>([]);
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [donations, setDonations] = useState<DonationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedDonor, setExpandedDonor] = useState<string | null>(null);
  const [expandedRequest, setExpandedRequest] = useState<string | null>(null);
  const [editingDonor, setEditingDonor] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<DonorRow>>({});

  // noindex for admin page
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    return () => { document.head.removeChild(meta); };
  }, []);

  const loadData = useCallback(async () => {
    const [d, r, dn] = await Promise.all([
      supabase.from("donors").select("id, full_name, blood_group, batch_session, phone, email, gender, available_now, created_at, approval_status, current_area, hall_hostel, weight, health_notes, last_donation_date, student_roll, year_semester, facebook_link, donor_status").order("created_at", { ascending: false }).limit(5000),
      supabase.from("emergency_requests").select("id, patient_name, blood_group, units_needed, hospital, contact_number, urgency_level, status, current_area, created_at, solved_at, notes, ward_cabin, is_pinned").order("created_at", { ascending: false }).limit(5000),
      supabase.from("donations").select("id, donor_id, blood_group, donation_date, units_donated, created_at, patient_name, hospital").order("donation_date", { ascending: false }).limit(5000),
    ]);
    if (d.data) setDonors(d.data as unknown as DonorRow[]);
    if (r.data) setRequests(r.data as unknown as RequestRow[]);
    if (dn.data) setDonations(dn.data as unknown as DonationRow[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
    const channel = supabase
      .channel("admin-realtime-all")
      .on("postgres_changes", { event: "*", schema: "public", table: "donors" }, () => loadData())
      .on("postgres_changes", { event: "*", schema: "public", table: "emergency_requests" }, () => loadData())
      .on("postgres_changes", { event: "*", schema: "public", table: "donations" }, () => loadData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [loadData]);

  /* ════════ Actions ════════ */

  const handleApproval = async (donorId: string, status: "approved" | "rejected") => {
    const { error } = await supabase.from("donors").update({ approval_status: status }).eq("id", donorId);
    if (error) { toast.error(`Failed: ${error.message}`); return; }
    toast.success(status === "approved" ? "Donor approved ✓" : "Donor rejected");
    setDonors(prev => prev.map(d => d.id === donorId ? { ...d, approval_status: status } : d));
  };

  const handleDeleteDonor = async (donorId: string, name: string) => {
    if (!confirm(`Delete donor "${name}" permanently?`)) return;
    // We can't delete via RLS (no DELETE policy), so we mark as rejected + clear data
    const { error } = await supabase.from("donors").update({ approval_status: "deleted", full_name: "[Deleted]", phone: "0000" }).eq("id", donorId);
    if (error) { toast.error(`Failed: ${error.message}`); return; }
    toast.success("Donor removed");
    setDonors(prev => prev.filter(d => d.id !== donorId));
  };

  const handleMarkSuspicious = async (donorId: string) => {
    const { error } = await supabase.from("donors").update({ approval_status: "suspicious" }).eq("id", donorId);
    if (error) { toast.error(`Failed: ${error.message}`); return; }
    toast.success("Marked as suspicious");
    setDonors(prev => prev.map(d => d.id === donorId ? { ...d, approval_status: "suspicious" } : d));
  };

  const handleToggleAvailability = async (donorId: string, current: boolean) => {
    const { error } = await supabase.from("donors").update({ available_now: !current }).eq("id", donorId);
    if (error) { toast.error(`Failed: ${error.message}`); return; }
    setDonors(prev => prev.map(d => d.id === donorId ? { ...d, available_now: !current } : d));
  };

  const handleSaveEdit = async (donorId: string) => {
    const { error } = await supabase.from("donors").update(editForm).eq("id", donorId);
    if (error) { toast.error(`Save failed: ${error.message}`); return; }
    toast.success("Donor updated");
    setEditingDonor(null);
    setEditForm({});
    loadData();
  };

  const handleMarkSolved = async (requestId: string) => {
    const { error } = await supabase.from("emergency_requests").update({ status: "solved" as any, solved_at: new Date().toISOString() }).eq("id", requestId);
    if (error) { toast.error(`Failed: ${error.message}`); return; }
    toast.success("Request marked as solved ✓");
    setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: "solved", solved_at: new Date().toISOString() } : r));
  };

  const handleExpireRequest = async (requestId: string) => {
    const { error } = await supabase.from("emergency_requests").update({ status: "expired" as any }).eq("id", requestId);
    if (error) { toast.error(`Failed: ${error.message}`); return; }
    toast.success("Request archived");
    setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: "expired" } : r));
  };

  const handlePinRequest = async (requestId: string, current: boolean) => {
    const { error } = await supabase.from("emergency_requests").update({ is_pinned: !current }).eq("id", requestId);
    if (error) { toast.error(`Failed: ${error.message}`); return; }
    setRequests(prev => prev.map(r => r.id === requestId ? { ...r, is_pinned: !current } : r));
  };

  const handleReactivateRequest = async (requestId: string) => {
    const { error } = await supabase.from("emergency_requests").update({ status: "active" as any, solved_at: null }).eq("id", requestId);
    if (error) { toast.error(`Failed: ${error.message}`); return; }
    toast.success("Request reactivated");
    setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: "active", solved_at: null } : r));
  };

  /* ════════ Derived data ════════ */

  const approvedDonors = donors.filter(d => d.approval_status === "approved");
  const pendingDonors = donors.filter(d => d.approval_status === "pending");
  const suspiciousDonors = donors.filter(d => d.approval_status === "suspicious");
  const rejectedDonors = donors.filter(d => d.approval_status === "rejected");
  const activeDonors = approvedDonors.filter(d => d.available_now).length;
  const activeRequests = requests.filter(r => r.status === "active");
  const solvedRequests = requests.filter(r => r.status === "solved");
  const rareGroups = ["O-", "A-", "B-", "AB-"];
  const rareDonors = approvedDonors.filter(d => rareGroups.includes(d.blood_group));

  const filteredDonors = useMemo(() => {
    if (!searchQuery.trim()) return approvedDonors;
    const q = searchQuery.toLowerCase();
    return approvedDonors.filter(d =>
      d.full_name.toLowerCase().includes(q) ||
      d.blood_group.toLowerCase().includes(q) ||
      d.phone.includes(q) ||
      d.batch_session.toLowerCase().includes(q)
    );
  }, [approvedDonors, searchQuery]);

  const solvedWithin1h = useMemo(() => {
    const solved = requests.filter(r => r.status === "solved" && r.solved_at);
    if (solved.length === 0) return 0;
    const fast = solved.filter(r => {
      const diff = new Date(r.solved_at!).getTime() - new Date(r.created_at).getTime();
      return diff <= 3600000;
    });
    return Math.round((fast.length / solved.length) * 100);
  }, [requests]);

  const mostRequested = useMemo(() => {
    const counts: Record<string, number> = {};
    requests.forEach(r => { counts[r.blood_group] = (counts[r.blood_group] || 0) + 1; });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return sorted[0] || ["—", 0];
  }, [requests]);

  const last7DaysTrend = useMemo(() => {
    const days: { label: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStr = date.toISOString().split("T")[0];
      const label = date.toLocaleDateString("en-US", { weekday: "short" });
      const count = requests.filter(r => r.created_at.startsWith(dayStr)).length;
      days.push({ label, count });
    }
    return days;
  }, [requests]);
  const maxTrend = Math.max(...last7DaysTrend.map(d => d.count), 1);

  const donorsByBatch = useMemo(() => {
    const counts: Record<string, number> = {};
    approvedDonors.forEach(d => { counts[d.batch_session] = (counts[d.batch_session] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [approvedDonors]);

  const hotspots = useMemo(() => {
    const counts: Record<string, number> = {};
    requests.filter(r => r.current_area).forEach(r => {
      counts[r.current_area!] = (counts[r.current_area!] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [requests]);

  const topDonors = useMemo(() => {
    const counts: Record<string, { name: string; count: number; units: number }> = {};
    donations.forEach(d => {
      const donor = approvedDonors.find(dn => dn.id === d.donor_id);
      if (!donor) return;
      if (!counts[d.donor_id]) counts[d.donor_id] = { name: donor.full_name, count: 0, units: 0 };
      counts[d.donor_id].count++;
      counts[d.donor_id].units += d.units_donated;
    });
    return Object.entries(counts).map(([id, v]) => ({ id, ...v })).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [donations, approvedDonors]);

  /* ════════ Shared UI pieces ════════ */

  const StatusBadge = ({ status }: { status: string }) => {
    const colors: Record<string, string> = {
      approved: "bg-green-500/10 text-green-600 dark:text-green-400",
      pending: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
      rejected: "bg-red-500/10 text-red-600 dark:text-red-400",
      suspicious: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
      active: "bg-primary/10 text-primary",
      solved: "bg-green-500/10 text-green-600 dark:text-green-400",
      expired: "bg-muted text-muted-foreground",
      critical: "bg-red-500/10 text-red-600 dark:text-red-400",
      urgent: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
      moderate: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    };
    return (
      <span className={`text-[10px] font-body font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${colors[status] || "bg-muted text-muted-foreground"}`}>
        {status}
      </span>
    );
  };

  const ActionBtn = ({ icon, label, onClick, variant = "default" }: { icon: React.ReactNode; label: string; onClick: () => void; variant?: "default" | "danger" | "success" }) => {
    const styles = {
      default: "bg-muted text-foreground hover:bg-accent",
      danger: "bg-red-500/10 text-red-600 hover:bg-red-500/20 dark:text-red-400",
      success: "bg-primary text-primary-foreground hover:bg-primary/90",
    };
    return (
      <button onClick={onClick} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-body text-xs font-bold active:scale-95 transition-all ${styles[variant]}`} title={label}>
        {icon}
        <span className="hidden sm:inline">{label}</span>
      </button>
    );
  };

  /* ════════ Tab: Pending ════════ */

  const renderPending = () => (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-headline text-xl font-bold italic text-foreground">
          Pending Approval ({pendingDonors.length})
        </h2>
        {pendingDonors.length > 0 && (
          <button onClick={() => exportCSV(pendingDonors, "pending-donors.csv")} className="flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-lg font-body text-xs font-bold hover:bg-accent transition-all">
            <Download className="h-3.5 w-3.5" /> Export
          </button>
        )}
      </div>
      {pendingDonors.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-2xl shadow-ambient">
          <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4 opacity-40" />
          <p className="font-headline text-xl italic text-muted-foreground">All clear</p>
          <p className="font-body text-sm text-muted-foreground mt-1">No pending donor submissions.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pendingDonors.map(d => {
            const isExpanded = expandedDonor === d.id;
            const isEditing = editingDonor === d.id;
            return (
              <div key={d.id} className="bg-card rounded-2xl shadow-ambient overflow-hidden">
                <div className="p-4 sm:p-5 flex flex-col gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-headline font-bold flex-shrink-0">
                      {d.full_name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-body text-sm font-bold text-foreground">{d.full_name}</p>
                      <p className="font-body text-xs text-muted-foreground">
                        {d.blood_group} • {d.batch_session} • {d.gender} • {timeAgo(d.created_at)}
                      </p>
                      <p className="font-body text-xs text-muted-foreground mt-0.5">📞 {d.phone}</p>
                    </div>
                    <button onClick={() => setExpandedDonor(isExpanded ? null : d.id)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                      {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                    </button>
                  </div>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="bg-background rounded-xl p-4 space-y-2 text-xs font-body">
                      {isEditing ? (
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <input className="bg-card rounded-lg px-3 py-2 text-foreground border border-border" placeholder="Name" defaultValue={d.full_name} onChange={e => setEditForm(f => ({ ...f, full_name: e.target.value }))} />
                            <input className="bg-card rounded-lg px-3 py-2 text-foreground border border-border" placeholder="Phone" defaultValue={d.phone} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} />
                            <input className="bg-card rounded-lg px-3 py-2 text-foreground border border-border" placeholder="Blood Group" defaultValue={d.blood_group} onChange={e => setEditForm(f => ({ ...f, blood_group: e.target.value }))} />
                            <input className="bg-card rounded-lg px-3 py-2 text-foreground border border-border" placeholder="Batch" defaultValue={d.batch_session} onChange={e => setEditForm(f => ({ ...f, batch_session: e.target.value }))} />
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => handleSaveEdit(d.id)} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-bold text-xs">Save</button>
                            <button onClick={() => { setEditingDonor(null); setEditForm({}); }} className="px-4 py-2 bg-muted text-muted-foreground rounded-lg font-bold text-xs">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                            <span className="text-muted-foreground">Roll:</span><span className="text-foreground">{d.student_roll || "—"}</span>
                            <span className="text-muted-foreground">Semester:</span><span className="text-foreground">{d.year_semester || "—"}</span>
                            <span className="text-muted-foreground">Area:</span><span className="text-foreground">{d.current_area || "—"}</span>
                            <span className="text-muted-foreground">Hall:</span><span className="text-foreground">{d.hall_hostel || "—"}</span>
                            <span className="text-muted-foreground">Weight:</span><span className="text-foreground">{d.weight || "—"}</span>
                            <span className="text-muted-foreground">Email:</span><span className="text-foreground truncate">{d.email || "—"}</span>
                            <span className="text-muted-foreground">Health:</span><span className="text-foreground">{d.health_notes || "—"}</span>
                            <span className="text-muted-foreground">Last Donation:</span><span className="text-foreground">{d.last_donation_date || "Never"}</span>
                          </div>
                          {d.facebook_link && (
                            <a href={d.facebook_link} target="_blank" rel="noopener noreferrer" className="text-primary underline">Facebook Profile</a>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    <ActionBtn icon={<CheckCircle className="h-3.5 w-3.5" />} label="Approve" onClick={() => handleApproval(d.id, "approved")} variant="success" />
                    <ActionBtn icon={<XCircle className="h-3.5 w-3.5" />} label="Reject" onClick={() => handleApproval(d.id, "rejected")} variant="danger" />
                    <ActionBtn icon={<Edit3 className="h-3.5 w-3.5" />} label="Edit" onClick={() => { setExpandedDonor(d.id); setEditingDonor(d.id); setEditForm({}); }} />
                    <ActionBtn icon={<Flag className="h-3.5 w-3.5" />} label="Suspicious" onClick={() => handleMarkSuspicious(d.id)} variant="danger" />
                    <ActionBtn icon={<Trash2 className="h-3.5 w-3.5" />} label="Delete" onClick={() => handleDeleteDonor(d.id, d.full_name)} variant="danger" />
                    <a href={waLink(d.phone)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-body text-xs font-bold bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20 transition-all active:scale-95">
                      <MessageCircle className="h-3.5 w-3.5" /> <span className="hidden sm:inline">WhatsApp</span>
                    </a>
                    <a href={`tel:${normalizeBDPhone(d.phone)}`} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-body text-xs font-bold bg-muted text-foreground hover:bg-accent transition-all active:scale-95">
                      <Phone className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Call</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Suspicious section */}
      {suspiciousDonors.length > 0 && (
        <div className="mt-8">
          <h3 className="font-headline text-lg font-bold italic text-foreground mb-3 flex items-center gap-2">
            <Flag className="h-4 w-4 text-orange-500" /> Suspicious ({suspiciousDonors.length})
          </h3>
          <div className="space-y-2">
            {suspiciousDonors.map(d => (
              <div key={d.id} className="bg-card rounded-xl p-4 shadow-ambient flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-body text-sm font-bold text-foreground">{d.full_name}</p>
                  <p className="font-body text-xs text-muted-foreground">{d.blood_group} • {d.phone} • {timeAgo(d.created_at)}</p>
                </div>
                <div className="flex gap-2">
                  <ActionBtn icon={<CheckCircle className="h-3.5 w-3.5" />} label="Approve" onClick={() => handleApproval(d.id, "approved")} variant="success" />
                  <ActionBtn icon={<Trash2 className="h-3.5 w-3.5" />} label="Delete" onClick={() => handleDeleteDonor(d.id, d.full_name)} variant="danger" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );

  /* ════════ Tab: Donors (approved) ════════ */

  const renderDonors = () => (
    <section>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h2 className="font-headline text-xl font-bold italic text-foreground">
          Approved Donors ({approvedDonors.length})
        </h2>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search donors..."
              className="bg-card rounded-xl pl-9 pr-4 py-2 font-body text-sm border border-border w-48 sm:w-64"
            />
          </div>
          <button onClick={() => exportCSV(approvedDonors, "approved-donors.csv")} className="flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-lg font-body text-xs font-bold hover:bg-accent transition-all">
            <Download className="h-3.5 w-3.5" /> Export
          </button>
        </div>
      </div>
      {filteredDonors.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-2xl shadow-ambient">
          <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
          <p className="font-body text-sm text-muted-foreground">No donors found.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredDonors.map(d => {
            const isExpanded = expandedDonor === d.id;
            const isEditing = editingDonor === d.id;
            return (
              <div key={d.id} className="bg-card rounded-xl shadow-ambient overflow-hidden">
                <div className="p-4 flex items-center gap-3">
                  <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-headline font-bold text-sm flex-shrink-0">
                    {d.full_name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-body text-sm font-bold text-foreground truncate">{d.full_name}</p>
                      <span className="bg-primary text-primary-foreground text-[10px] font-body font-bold px-1.5 py-0.5 rounded">{d.blood_group}</span>
                      {d.available_now && <span className="w-2 h-2 bg-green-500 rounded-full" title="Available" />}
                    </div>
                    <p className="font-body text-xs text-muted-foreground">{d.batch_session} • {d.phone}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => handleToggleAvailability(d.id, d.available_now)} className="p-1.5 rounded-lg hover:bg-muted" title={d.available_now ? "Set unavailable" : "Set available"}>
                      {d.available_now ? <Eye className="h-4 w-4 text-green-500" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                    </button>
                    <a href={waLink(d.phone)} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg hover:bg-muted"><MessageCircle className="h-4 w-4 text-green-600" /></a>
                    <a href={`tel:${normalizeBDPhone(d.phone)}`} className="p-1.5 rounded-lg hover:bg-muted"><Phone className="h-4 w-4 text-muted-foreground" /></a>
                    <button onClick={() => setExpandedDonor(isExpanded ? null : d.id)} className="p-1.5 rounded-lg hover:bg-muted">
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-border">
                    {isEditing ? (
                      <div className="pt-3 space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <input className="bg-background rounded-lg px-3 py-2 text-sm text-foreground border border-border" placeholder="Name" defaultValue={d.full_name} onChange={e => setEditForm(f => ({ ...f, full_name: e.target.value }))} />
                          <input className="bg-background rounded-lg px-3 py-2 text-sm text-foreground border border-border" placeholder="Phone" defaultValue={d.phone} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} />
                          <input className="bg-background rounded-lg px-3 py-2 text-sm text-foreground border border-border" placeholder="Blood Group" defaultValue={d.blood_group} onChange={e => setEditForm(f => ({ ...f, blood_group: e.target.value }))} />
                          <input className="bg-background rounded-lg px-3 py-2 text-sm text-foreground border border-border" placeholder="Area" defaultValue={d.current_area || ""} onChange={e => setEditForm(f => ({ ...f, current_area: e.target.value }))} />
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleSaveEdit(d.id)} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-bold text-xs">Save</button>
                          <button onClick={() => { setEditingDonor(null); setEditForm({}); }} className="px-4 py-2 bg-muted text-muted-foreground rounded-lg font-bold text-xs">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div className="pt-3 space-y-2 text-xs font-body">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                          <span className="text-muted-foreground">Gender:</span><span className="text-foreground">{d.gender}</span>
                          <span className="text-muted-foreground">Roll:</span><span className="text-foreground">{d.student_roll || "—"}</span>
                          <span className="text-muted-foreground">Area:</span><span className="text-foreground">{d.current_area || "—"}</span>
                          <span className="text-muted-foreground">Hall:</span><span className="text-foreground">{d.hall_hostel || "—"}</span>
                          <span className="text-muted-foreground">Weight:</span><span className="text-foreground">{d.weight || "—"}</span>
                          <span className="text-muted-foreground">Last Donated:</span><span className="text-foreground">{d.last_donation_date || "Never"}</span>
                        </div>
                        <div className="flex gap-2 pt-2">
                          <ActionBtn icon={<Edit3 className="h-3.5 w-3.5" />} label="Edit" onClick={() => { setEditingDonor(d.id); setEditForm({}); }} />
                          <ActionBtn icon={<XCircle className="h-3.5 w-3.5" />} label="Revoke" onClick={() => handleApproval(d.id, "rejected")} variant="danger" />
                          <ActionBtn icon={<Flag className="h-3.5 w-3.5" />} label="Flag" onClick={() => handleMarkSuspicious(d.id)} variant="danger" />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );

  /* ════════ Tab: Requests ════════ */

  const renderRequests = () => {
    const sorted = [...requests].sort((a, b) => {
      if (a.status === "active" && b.status !== "active") return -1;
      if (a.status !== "active" && b.status === "active") return 1;
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return (
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-headline text-xl font-bold italic text-foreground">
            Emergency Requests ({requests.length})
          </h2>
          <button onClick={() => exportCSV(requests, "emergency-requests.csv")} className="flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-lg font-body text-xs font-bold hover:bg-accent transition-all">
            <Download className="h-3.5 w-3.5" /> Export
          </button>
        </div>
        {sorted.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-2xl shadow-ambient">
            <Activity className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
            <p className="font-body text-sm text-muted-foreground">No emergency requests.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sorted.map(r => {
              const isExpanded = expandedRequest === r.id;
              return (
                <div key={r.id} className={`bg-card rounded-2xl shadow-ambient overflow-hidden ${r.is_pinned ? "ring-2 ring-primary/30" : ""}`}>
                  <div className="p-4 sm:p-5">
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-headline font-bold text-sm flex-shrink-0 ${
                        r.urgency_level === "critical" ? "bg-red-500/10 text-red-600" : r.urgency_level === "urgent" ? "bg-orange-500/10 text-orange-600" : "bg-blue-500/10 text-blue-600"
                      }`}>
                        {r.blood_group}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-body text-sm font-bold text-foreground">{r.patient_name}</p>
                          <StatusBadge status={r.status} />
                          <StatusBadge status={r.urgency_level} />
                          {r.is_pinned && <Star className="h-3.5 w-3.5 text-primary fill-primary" />}
                        </div>
                        <p className="font-body text-xs text-muted-foreground">
                          {r.hospital} • {r.units_needed} unit{r.units_needed > 1 ? "s" : ""} • {timeAgo(r.created_at)}
                        </p>
                      </div>
                      <button onClick={() => setExpandedRequest(isExpanded ? null : r.id)} className="p-1.5 rounded-lg hover:bg-muted">
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="bg-background rounded-xl p-4 mb-3 text-xs font-body space-y-1">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                          <span className="text-muted-foreground">Contact:</span><span className="text-foreground">{r.contact_number}</span>
                          <span className="text-muted-foreground">Area:</span><span className="text-foreground">{r.current_area || "—"}</span>
                          <span className="text-muted-foreground">Ward/Cabin:</span><span className="text-foreground">{r.ward_cabin || "—"}</span>
                          <span className="text-muted-foreground">Notes:</span><span className="text-foreground">{r.notes || "—"}</span>
                          {r.solved_at && <><span className="text-muted-foreground">Solved:</span><span className="text-foreground">{formatDate(r.solved_at)}</span></>}
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {r.status === "active" && (
                        <>
                          <ActionBtn icon={<CheckCircle className="h-3.5 w-3.5" />} label="Solved" onClick={() => handleMarkSolved(r.id)} variant="success" />
                          <ActionBtn icon={<Star className="h-3.5 w-3.5" />} label={r.is_pinned ? "Unpin" : "Pin"} onClick={() => handlePinRequest(r.id, !!r.is_pinned)} />
                        </>
                      )}
                      {r.status !== "active" && (
                        <ActionBtn icon={<Activity className="h-3.5 w-3.5" />} label="Reactivate" onClick={() => handleReactivateRequest(r.id)} />
                      )}
                      {r.status === "active" && (
                        <ActionBtn icon={<Archive className="h-3.5 w-3.5" />} label="Archive" onClick={() => handleExpireRequest(r.id)} variant="danger" />
                      )}
                      <a href={waLink(r.contact_number)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-body text-xs font-bold bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20 transition-all active:scale-95">
                        <MessageCircle className="h-3.5 w-3.5" /> <span className="hidden sm:inline">WhatsApp</span>
                      </a>
                      <a href={`tel:${normalizeBDPhone(r.contact_number)}`} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-body text-xs font-bold bg-muted text-foreground hover:bg-accent transition-all active:scale-95">
                        <Phone className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Call</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    );
  };

  /* ════════ Tab: Donations ════════ */

  const renderDonations = () => (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-headline text-xl font-bold italic text-foreground">
          Donation History ({donations.length})
        </h2>
        <button onClick={() => exportCSV(donations, "donations.csv")} className="flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-lg font-body text-xs font-bold hover:bg-accent transition-all">
          <Download className="h-3.5 w-3.5" /> Export
        </button>
      </div>
      {donations.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-2xl shadow-ambient">
          <Heart className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
          <p className="font-body text-sm text-muted-foreground">No donations recorded yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {donations.map(d => {
            const donor = donors.find(dn => dn.id === d.donor_id);
            return (
              <div key={d.id} className="bg-card rounded-xl p-4 shadow-ambient flex items-center gap-3">
                <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-headline text-sm font-bold flex-shrink-0">
                  {donor?.full_name.charAt(0) || "?"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-body text-sm font-bold text-foreground truncate">{donor?.full_name || "Unknown"}</p>
                  <p className="font-body text-xs text-muted-foreground">
                    {d.blood_group} • {d.units_donated}u • {d.hospital || "—"} • {formatDate(d.donation_date)}
                  </p>
                  {d.patient_name && <p className="font-body text-xs text-muted-foreground">Patient: {d.patient_name}</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );

  /* ════════ Tab: Overview ════════ */

  const renderOverview = () => (
    <>
      {/* KPI cards — clickable */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        {[
          { icon: <Users className="h-5 w-5" />, label: "Approved Donors", value: approvedDonors.length, sub: `${activeDonors} active`, tab: "donors" as AdminTab },
          { icon: <Activity className="h-5 w-5" />, label: "Active Requests", value: activeRequests.length, sub: `${solvedRequests.length} solved`, tab: "requests" as AdminTab },
          { icon: <Heart className="h-5 w-5" />, label: "Total Donations", value: donations.length, sub: `${donations.reduce((s, d) => s + d.units_donated, 0)} units`, tab: "donations" as AdminTab },
          { icon: <Clock className="h-5 w-5" />, label: "Solved < 1hr", value: `${solvedWithin1h}%`, sub: "response rate", tab: "requests" as AdminTab },
        ].map(kpi => (
          <button
            key={kpi.label}
            onClick={() => setActiveTab(kpi.tab)}
            className="bg-card rounded-2xl p-5 shadow-ambient text-left hover:ring-2 hover:ring-primary/20 transition-all group"
          >
            <div className="text-primary mb-2 group-hover:scale-110 transition-transform">{kpi.icon}</div>
            <p className="font-headline text-2xl sm:text-3xl font-bold text-foreground">{kpi.value}</p>
            <p className="font-body text-[10px] uppercase tracking-widest text-muted-foreground font-bold mt-1">{kpi.label}</p>
            <p className="font-body text-xs text-muted-foreground mt-0.5">{kpi.sub}</p>
          </button>
        ))}
      </div>

      {/* Pending alert */}
      {pendingDonors.length > 0 && (
        <button onClick={() => setActiveTab("pending")} className="w-full mb-8 flex items-center gap-3 bg-primary/10 border border-primary/20 rounded-2xl p-4 text-left hover:bg-primary/15 transition-colors">
          <ShieldAlert className="h-5 w-5 text-primary flex-shrink-0" />
          <div>
            <p className="font-body text-sm font-bold text-foreground">{pendingDonors.length} donor{pendingDonors.length > 1 ? "s" : ""} awaiting approval</p>
            <p className="font-body text-xs text-muted-foreground">Tap to review and approve</p>
          </div>
        </button>
      )}

      {/* Rare blood shortage — clickable */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        <div className="bg-card rounded-2xl p-6 shadow-ambient">
          <div className="flex items-center gap-2 mb-4">
            <Droplets className="h-5 w-5 text-primary" />
            <h3 className="font-headline text-lg font-bold italic text-foreground">Most Requested</h3>
          </div>
          <div className="flex items-end gap-4">
            <span className="bg-primary text-primary-foreground text-3xl font-headline font-bold px-4 py-2 rounded-xl">{mostRequested[0]}</span>
            <div>
              <p className="font-body text-sm text-foreground font-bold">{mostRequested[1]} requests</p>
              <p className="font-body text-xs text-muted-foreground">All time most needed</p>
            </div>
          </div>
          <div className="mt-5 space-y-2">
            {(() => {
              const counts: Record<string, number> = {};
              requests.forEach(r => { counts[r.blood_group] = (counts[r.blood_group] || 0) + 1; });
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

        <button onClick={() => setActiveTab("donors")} className="bg-card rounded-2xl p-6 shadow-ambient text-left hover:ring-2 hover:ring-primary/20 transition-all">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-primary" />
            <h3 className="font-headline text-lg font-bold italic text-foreground">Rare Blood Donors</h3>
          </div>
          <div className="space-y-3">
            {rareGroups.map(g => {
              const count = approvedDonors.filter(d => d.blood_group === g).length;
              const requested = requests.filter(r => r.blood_group === g).length;
              return (
                <div key={g} className="flex items-center justify-between bg-background rounded-xl px-4 py-3 shadow-ambient">
                  <div className="flex items-center gap-3">
                    <span className="bg-primary text-primary-foreground text-sm font-body font-bold px-2.5 py-0.5 rounded">{g}</span>
                    <div>
                      <p className="font-body text-sm font-bold text-foreground">{count} donors</p>
                      <p className="font-body text-xs text-muted-foreground">{requested} times requested</p>
                    </div>
                  </div>
                  {count < 3 && (
                    <span className="text-[10px] font-body font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-1 rounded-full">Critical</span>
                  )}
                </div>
              );
            })}
          </div>
        </button>
      </div>

      {/* Trend + Batch */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        <div className="bg-card rounded-2xl p-6 shadow-ambient">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h3 className="font-headline text-lg font-bold italic text-foreground">Last 7 Days</h3>
          </div>
          <div className="flex items-end gap-2 h-32">
            {last7DaysTrend.map(day => (
              <div key={day.label} className="flex-1 flex flex-col items-center gap-1">
                <span className="font-body text-[10px] font-bold text-muted-foreground">{day.count}</span>
                <div className="w-full bg-muted rounded-t-lg overflow-hidden flex-1 flex items-end">
                  <div className="w-full bg-primary rounded-t-lg transition-all" style={{ height: `${(day.count / maxTrend) * 100}%`, minHeight: day.count > 0 ? "4px" : "0" }} />
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
            ) : donorsByBatch.map(([batch, count]) => (
              <div key={batch} className="flex items-center gap-3">
                <span className="w-20 font-body text-xs font-bold text-foreground truncate">{batch}</span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(count / (donorsByBatch[0]?.[1] || 1)) * 100}%` }} />
                </div>
                <span className="font-body text-xs text-muted-foreground w-6 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hotspots + Top donors + Recent donations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <button onClick={() => setActiveTab("requests")} className="bg-card rounded-2xl p-6 shadow-ambient text-left hover:ring-2 hover:ring-primary/20 transition-all">
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
                  <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-[10px] font-body font-bold text-primary">{i + 1}</span>
                  <span className="font-body text-sm text-foreground flex-1 truncate">{area}</span>
                  <span className="font-body text-xs text-muted-foreground">{count} req</span>
                </div>
              ))}
            </div>
          )}
        </button>

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
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-body ${i === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{i + 1}</span>
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

        <button onClick={() => setActiveTab("donations")} className="bg-card rounded-2xl p-6 shadow-ambient text-left hover:ring-2 hover:ring-primary/20 transition-all">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="h-5 w-5 text-primary" />
            <h3 className="font-headline text-lg font-bold italic text-foreground">Recent Donations</h3>
          </div>
          {donations.slice(0, 5).length === 0 ? (
            <p className="font-body text-sm text-muted-foreground">No donations yet.</p>
          ) : (
            <div className="space-y-3">
              {donations.slice(0, 5).map(d => {
                const donor = donors.find(dn => dn.id === d.donor_id);
                return (
                  <div key={d.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-headline text-sm font-bold flex-shrink-0">{donor?.full_name.charAt(0) || "?"}</div>
                    <div className="min-w-0 flex-1">
                      <p className="font-body text-sm font-bold text-foreground truncate">{donor?.full_name || "Unknown"}</p>
                      <p className="font-body text-xs text-muted-foreground">{d.blood_group} • {d.units_donated}u • {timeAgo(d.created_at)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </button>
      </div>
    </>
  );

  /* ════════ Render ════════ */

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-7xl mx-auto px-6 pt-24 pb-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
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

  const tabs: { key: AdminTab; label: string; icon: React.ReactNode; count?: number }[] = [
    { key: "overview", label: "Overview", icon: <BarChart3 className="h-4 w-4" /> },
    { key: "pending", label: "Pending", icon: <ShieldAlert className="h-4 w-4" />, count: pendingDonors.length },
    { key: "donors", label: "Donors", icon: <Users className="h-4 w-4" />, count: approvedDonors.length },
    { key: "requests", label: "Requests", icon: <Activity className="h-4 w-4" />, count: activeRequests.length },
    { key: "donations", label: "Donations", icon: <Heart className="h-4 w-4" />, count: donations.length },
  ];

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-12">
        <section className="mb-6">
          <h1 className="font-headline text-3xl sm:text-4xl lg:text-5xl font-bold text-primary tracking-tight italic mb-1">
            Admin Console
          </h1>
          <p className="font-headline italic text-muted-foreground text-sm">
            Live moderation panel — Crimson Verse
          </p>
        </section>

        {/* Tab bar */}
        <div className="flex gap-1.5 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-body text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === t.key ? "bg-primary text-primary-foreground shadow-lg" : "bg-card text-muted-foreground hover:bg-muted"
              }`}
            >
              {t.icon}
              {t.label}
              {t.count !== undefined && (
                <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full ${
                  activeTab === t.key ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {activeTab === "overview" && renderOverview()}
        {activeTab === "pending" && renderPending()}
        {activeTab === "donors" && renderDonors()}
        {activeTab === "requests" && renderRequests()}
        {activeTab === "donations" && renderDonations()}
      </main>
      <Footer />
    </div>
  );
};

export default DashboardPage;
