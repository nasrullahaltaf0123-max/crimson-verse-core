import { useState, useMemo, useEffect } from "react";
import { SlidersHorizontal, X, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BloodGroupPill, bloodGroups, type BloodGroup } from "@/components/BloodGroupPill";
import DonorCard, { type Donor } from "@/components/DonorCard";
import { CrimsonButton } from "@/components/CrimsonButton";
import { rankDonors, getDonorBadges, type RankBadge } from "@/lib/donorRanking";

const batches = ["All Batches", "2017-18", "2018-19", "2019-20", "2020-21", "2021-22", "2022-23", "2023-24", "2024-25", "2025-26", "2026-27", "2027-28", "2028-29", "2029-30", "Alumni"];
const genders = ["Any", "Male", "Female"] as const;

const SearchPage = () => {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<BloodGroup | null>(null);
  const [selectedBatch, setSelectedBatch] = useState("All Batches");
  const [selectedGender, setSelectedGender] = useState<string>("Any");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fetchDonors = async () => {
    const { data, error } = await supabase
      .from("donors")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setDonors(
        data.map((d) => ({
          id: d.id,
          name: d.full_name,
          bloodGroup: d.blood_group as BloodGroup,
          batch: d.batch_session,
          gender: d.gender as "Male" | "Female" | "Other",
          lastDonated: d.last_donation_date || "Not recorded",
          available: d.available_now,
          phone: d.phone,
          whatsapp: d.phone.replace(/[^0-9]/g, ""),
          createdAt: d.created_at,
        }))
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDonors();

    const channel = supabase
      .channel("donors-feed")
      .on("postgres_changes", { event: "*", schema: "public", table: "donors" }, () => fetchDonors())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const filtered = useMemo(() => {
    let result = donors.filter((d) => {
      if (selectedBloodGroup && d.bloodGroup !== selectedBloodGroup) return false;
      if (selectedBatch !== "All Batches" && d.batch !== selectedBatch) return false;
      if (selectedGender !== "Any" && d.gender !== selectedGender) return false;
      if (availableOnly && !d.available) return false;
      return true;
    });

    // AI ranking
    const rankable = result.map(d => ({
      ...d,
      blood_group: d.bloodGroup,
      current_area: null as string | null,
      available_now: d.available,
      last_donation_date: d.lastDonated === "Not recorded" ? null : d.lastDonated,
      created_at: d.createdAt || new Date().toISOString(),
      donation_count: 0,
    }));
    const ranked = rankDonors(rankable, {
      targetBloodGroup: selectedBloodGroup || undefined,
    });

    return ranked.map((r, i) => ({
      donor: r as unknown as Donor,
      badges: getDonorBadges(r, i),
    }));
  }, [donors, selectedBloodGroup, selectedBatch, selectedGender, availableOnly]);

  const activeDonorCount = donors.filter((d) => d.available).length;

  const FilterControls = () => (
    <>
      {/* Batch */}
      <div>
        <span className="text-muted-foreground font-body font-bold text-xs tracking-widest uppercase block mb-3">
          Departmental Batch
        </span>
        <select
          value={selectedBatch}
          onChange={(e) => setSelectedBatch(e.target.value)}
          className="w-full bg-card border-none rounded-lg p-3 text-foreground font-body text-sm focus:ring-2 focus:ring-ring shadow-ambient"
        >
          {batches.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </div>

      {/* Gender */}
      <div className="mt-6">
        <span className="text-muted-foreground font-body font-bold text-xs tracking-widest uppercase block mb-3">
          Gender
        </span>
        <div className="flex gap-2">
          {genders.map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGender(g)}
              className={`px-4 py-2 text-xs font-body font-bold rounded-lg transition-all active:scale-95 ${
                selectedGender === g
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-foreground hover:bg-muted"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div className="mt-6 flex items-center justify-between">
        <div>
          <span className="text-muted-foreground font-body font-bold text-xs tracking-widest uppercase block">
            Available Only
          </span>
          <span className="text-xs text-muted-foreground font-body">Show immediate donors</span>
        </div>
        <button
          onClick={() => setAvailableOnly(!availableOnly)}
          className={`relative w-12 h-7 rounded-full transition-colors ${
            availableOnly ? "bg-primary" : "bg-muted"
          }`}
        >
          <div
            className={`absolute top-1 w-5 h-5 rounded-full bg-card shadow-ambient transition-transform ${
              availableOnly ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 pt-24 pb-24 lg:pb-12">
        {/* Editorial header */}
        <section className="mb-12 lg:mb-16 pt-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <h1 className="font-headline text-4xl sm:text-5xl lg:text-6xl font-bold text-primary tracking-tight leading-none mb-4 italic">
                The Life Search
              </h1>
              <p className="text-lg lg:text-xl text-muted-foreground font-headline italic">
                Every drop is a story waiting to continue. Filter through our community of student donors to find your literal lifeline.
              </p>
            </div>
            <div className="bg-primary text-primary-foreground px-5 py-4 rounded-xl flex items-center gap-3 shadow-elevated self-start">
              <Activity className="h-5 w-5" />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-widest font-bold font-body opacity-80">Live Status</span>
                <span className="font-bold font-body">{activeDonorCount} Active Donors</span>
              </div>
            </div>
          </div>
        </section>

        {/* Filter bento grid */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
          {/* Blood group selector */}
          <div className="lg:col-span-8 bg-surface-low p-6 lg:p-8 rounded-2xl">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-primary font-body font-bold text-sm tracking-widest uppercase">Select Blood Group</span>
              <div className="h-px flex-grow bg-border/50" />
              {selectedBloodGroup && (
                <button
                  onClick={() => setSelectedBloodGroup(null)}
                  className="text-xs text-muted-foreground font-body hover:text-foreground transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
              {bloodGroups.map((g) => (
                <BloodGroupPill
                  key={g}
                  group={g}
                  active={selectedBloodGroup === g}
                  onClick={() => setSelectedBloodGroup(selectedBloodGroup === g ? null : g)}
                  className="rounded-lg py-3"
                />
              ))}
            </div>
          </div>

          {/* Secondary filters — desktop */}
          <div className="hidden lg:flex lg:col-span-4 bg-surface-container p-8 rounded-2xl flex-col justify-between">
            <FilterControls />
          </div>

          {/* Mobile filter button */}
          <div className="lg:hidden">
            <CrimsonButton
              variant="outline"
              size="default"
              className="w-full"
              onClick={() => setDrawerOpen(true)}
            >
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filters
              {(selectedBatch !== "All Batches" || selectedGender !== "Any" || availableOnly) && (
                <span className="ml-2 bg-primary text-primary-foreground text-[10px] px-2 py-0.5 rounded-full font-body">
                  Active
                </span>
              )}
            </CrimsonButton>
          </div>
        </section>

        {/* Results header */}
        <div className="flex items-center gap-4 mb-8">
          <h2 className="font-headline text-2xl font-bold italic text-foreground whitespace-nowrap">Available Donors</h2>
          <div className="h-[1px] flex-grow bg-border/50" />
          <span className="font-body text-xs font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
            {loading ? "Loading..." : `Showing ${filtered.length} ${filtered.length === 1 ? "Match" : "Matches"}`}
          </span>
        </div>

        {/* Donor grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card rounded-2xl p-6 animate-pulse">
                <div className="h-16 bg-muted rounded mb-4" />
                <div className="h-4 bg-muted rounded w-2/3 mb-2" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((donor, i) => (
              <div key={donor.id} className="animate-fade-up" style={{ animationDelay: `${i * 80}ms` }}>
                <DonorCard donor={donor} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="font-headline text-2xl italic text-muted-foreground mb-2">No donors found</p>
            <p className="font-body text-sm text-muted-foreground">Try adjusting your filters.</p>
          </div>
        )}
      </main>

      {/* Mobile filter drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-background rounded-t-3xl p-6 pb-10 shadow-elevated animate-fade-up max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-headline text-xl font-bold italic text-foreground">Filters</h3>
              <button onClick={() => setDrawerOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-6 w-6" />
              </button>
            </div>
            <FilterControls />
            <CrimsonButton
              variant="primary"
              className="w-full mt-8"
              onClick={() => setDrawerOpen(false)}
            >
              Show {filtered.length} Results
            </CrimsonButton>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default SearchPage;
