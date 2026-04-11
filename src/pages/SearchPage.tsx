import { useState, useMemo } from "react";
import { SlidersHorizontal, X, Activity } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BloodGroupPill, bloodGroups, type BloodGroup } from "@/components/BloodGroupPill";
import DonorCard, { type Donor } from "@/components/DonorCard";
import { CrimsonButton } from "@/components/CrimsonButton";

const MOCK_DONORS: Donor[] = [
  { id: "1", name: "Julian Thorne", bloodGroup: "O-", batch: "Batch 2022-26", gender: "Male", lastDonated: "4 months ago", available: true, phone: "+91000000001", whatsapp: "91000000001" },
  { id: "2", name: "Elena Vance", bloodGroup: "A+", batch: "Batch 2021-25", gender: "Female", lastDonated: "1 year ago", available: true, phone: "+91000000002", whatsapp: "91000000002" },
  { id: "3", name: "Marcus Reed", bloodGroup: "B-", batch: "Batch 2023-27", gender: "Male", lastDonated: "Never donated", available: false, phone: "+91000000003", whatsapp: "91000000003" },
  { id: "4", name: "Priya Sharma", bloodGroup: "AB+", batch: "Batch 2022-26", gender: "Female", lastDonated: "6 months ago", available: true, phone: "+91000000004", whatsapp: "91000000004" },
  { id: "5", name: "Aarav Menon", bloodGroup: "O+", batch: "Batch 2023-27", gender: "Male", lastDonated: "2 months ago", available: true, phone: "+91000000005", whatsapp: "91000000005" },
  { id: "6", name: "Fatima Begum", bloodGroup: "A-", batch: "Batch 2021-25", gender: "Female", lastDonated: "8 months ago", available: true, phone: "+91000000006", whatsapp: "91000000006" },
  { id: "7", name: "Rohan Das", bloodGroup: "B+", batch: "Batch 2022-26", gender: "Male", lastDonated: "3 months ago", available: true, phone: "+91000000007", whatsapp: "91000000007" },
  { id: "8", name: "Nadia Khatun", bloodGroup: "AB-", batch: "Batch 2023-27", gender: "Female", lastDonated: "Never donated", available: false, phone: "+91000000008", whatsapp: "91000000008" },
  { id: "9", name: "Samuel Gomez", bloodGroup: "O-", batch: "Batch 2021-25", gender: "Male", lastDonated: "5 months ago", available: true, phone: "+91000000009", whatsapp: "91000000009" },
];

const batches = ["All Batches", "2017-18", "2018-19", "2019-20", "2020-21", "2021-22", "2022-23", "2023-24", "2024-25", "Alumni"];
const genders = ["Any", "Male", "Female"] as const;

const SearchPage = () => {
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<BloodGroup | null>(null);
  const [selectedBatch, setSelectedBatch] = useState("All Batches");
  const [selectedGender, setSelectedGender] = useState<string>("Any");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filtered = useMemo(() => {
    return MOCK_DONORS.filter((d) => {
      if (selectedBloodGroup && d.bloodGroup !== selectedBloodGroup) return false;
      if (selectedBatch !== "All Batches" && d.batch !== selectedBatch) return false;
      if (selectedGender !== "Any" && d.gender !== selectedGender) return false;
      if (availableOnly && !d.available) return false;
      return true;
    });
  }, [selectedBloodGroup, selectedBatch, selectedGender, availableOnly]);

  const activeDonorCount = MOCK_DONORS.filter((d) => d.available).length;

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
      <main className="max-w-7xl mx-auto px-6 pt-24 pb-12 mb-20 md:mb-0">
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
            Showing {filtered.length} {filtered.length === 1 ? "Match" : "Matches"}
          </span>
        </div>

        {/* Donor grid */}
        {filtered.length > 0 ? (
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
