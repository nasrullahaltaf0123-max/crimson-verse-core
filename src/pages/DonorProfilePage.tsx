import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CrimsonButton } from "@/components/CrimsonButton";
import { Phone, Search, Heart, Clock, MapPin, Calendar, Check, Edit2 } from "lucide-react";

interface DonorProfile {
  id: string;
  full_name: string;
  phone: string;
  blood_group: string;
  batch_session: string;
  gender: string;
  available_now: boolean;
  current_area: string | null;
  created_at: string;
  access_token: string | null;
}

interface DonationRecord {
  id: string;
  donation_date: string;
  patient_name: string | null;
  blood_group: string;
  hospital: string | null;
  area: string | null;
  units_donated: number;
  patient_relation: string | null;
  donor_note: string | null;
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
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
};

const nextEligible = (lastDonation: string) => {
  const last = new Date(lastDonation);
  const eligible = new Date(last.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 days
  const now = new Date();
  if (eligible <= now) return "Eligible now";
  const daysLeft = Math.ceil((eligible.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
  return `${daysLeft} days until eligible`;
};

const DonorProfilePage = () => {
  const [searchParams] = useSearchParams();
  const tokenParam = searchParams.get("token");

  const [phone, setPhone] = useState("");
  const [profile, setProfile] = useState<DonorProfile | null>(null);
  const [donations, setDonations] = useState<DonationRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isOwner, setIsOwner] = useState(false);
  const [editingAvailability, setEditingAvailability] = useState(false);

  // Auto-load via token
  useEffect(() => {
    if (tokenParam) {
      loadByToken(tokenParam);
    }
  }, [tokenParam]);

  const loadByToken = async (token: string) => {
    setLoading(true);
    setError("");
    const { data } = await supabase
      .from("donors")
      .select("*")
      .eq("access_token", token)
      .single();

    if (data) {
      setProfile(data as unknown as DonorProfile);
      setIsOwner(true);
      fetchDonations(data.id);
    } else {
      setError("Invalid profile link.");
    }
    setLoading(false);
  };

  const lookupByPhone = async () => {
    if (!phone.trim() || !/^\+?\d{10,15}$/.test(phone.replace(/\s/g, ""))) {
      setError("Enter a valid phone number");
      return;
    }
    setLoading(true);
    setError("");
    const { data } = await supabase
      .from("donors")
      .select("*")
      .eq("phone", phone.trim())
      .single();

    if (data) {
      setProfile(data as unknown as DonorProfile);
      setIsOwner(true);
      fetchDonations(data.id);
    } else {
      setError("No donor found with this phone number.");
    }
    setLoading(false);
  };

  const fetchDonations = async (donorId: string) => {
    const { data } = await supabase
      .from("donations")
      .select("*")
      .eq("donor_id", donorId)
      .order("donation_date", { ascending: false });

    if (data) setDonations(data as unknown as DonationRecord[]);
  };

  const toggleAvailability = async () => {
    if (!profile) return;
    const newVal = !profile.available_now;
    await supabase.from("donors").update({ available_now: newVal }).eq("id", profile.id);
    setProfile({ ...profile, available_now: newVal });
  };

  const totalUnits = donations.reduce((sum, d) => sum + d.units_donated, 0);
  const lastDonation = donations.length > 0 ? donations[0] : null;

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      <Navbar />
      <main className="max-w-2xl mx-auto px-6 pt-24 pb-12">
        <h1 className="font-headline text-3xl sm:text-4xl font-bold text-primary tracking-tight italic mb-2">
          My Donor Profile
        </h1>
        <p className="font-headline italic text-muted-foreground mb-8">
          Access your profile, update availability, and track your donation history.
        </p>

        {/* Phone lookup */}
        {!profile && !tokenParam && (
          <div className="bg-card rounded-2xl p-6 shadow-ambient">
            <h3 className="font-headline text-xl font-bold italic text-foreground mb-4">Find Your Profile</h3>
            <p className="font-body text-sm text-muted-foreground mb-5">
              Enter the phone number you registered with.
            </p>
            <div className="flex gap-3">
              <input
                type="tel"
                value={phone}
                onChange={(e) => { setPhone(e.target.value); setError(""); }}
                placeholder="+880 1XXX..."
                className="flex-1 bg-background rounded-xl px-4 py-3.5 font-body text-base text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring shadow-ambient"
                onKeyDown={(e) => e.key === "Enter" && lookupByPhone()}
              />
              <CrimsonButton variant="primary" onClick={lookupByPhone} disabled={loading}>
                <Search className="h-4 w-4 mr-2" />
                {loading ? "..." : "Find"}
              </CrimsonButton>
            </div>
            {error && <p className="text-destructive text-sm font-body mt-3">{error}</p>}
          </div>
        )}

        {loading && !profile && (
          <div className="bg-card rounded-2xl p-8 animate-pulse mt-6">
            <div className="h-6 bg-muted rounded w-1/3 mb-4" />
            <div className="h-4 bg-muted rounded w-2/3 mb-2" />
            <div className="h-4 bg-muted rounded w-1/2" />
          </div>
        )}

        {/* Profile card */}
        {profile && (
          <div className="space-y-6 mt-6 animate-fade-up">
            <div className="bg-card rounded-2xl p-6 shadow-ambient">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-headline text-2xl font-bold flex-shrink-0">
                  {profile.full_name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-headline text-xl font-bold text-foreground">{profile.full_name}</h3>
                  <p className="font-body text-sm text-muted-foreground">{profile.batch_session} • English Dept</p>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <span className="bg-primary text-primary-foreground text-sm font-body font-bold px-2.5 py-0.5 rounded">
                      {profile.blood_group}
                    </span>
                    {profile.current_area && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground font-body">
                        <MapPin className="h-3 w-3" />
                        {profile.current_area}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground font-body">
                      Joined {timeAgo(profile.created_at)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Availability toggle */}
              {isOwner && (
                <div className="mt-5 flex items-center justify-between bg-background rounded-xl px-4 py-4 shadow-ambient">
                  <div>
                    <span className="font-body text-sm font-bold text-foreground block">Available to donate</span>
                    <span className="font-body text-xs text-muted-foreground">
                      {profile.available_now ? "You're visible to requesters" : "You won't appear in matches"}
                    </span>
                  </div>
                  <button
                    onClick={toggleAvailability}
                    className={`relative w-12 h-7 rounded-full transition-colors ${profile.available_now ? "bg-primary" : "bg-muted"}`}
                  >
                    <div className={`absolute top-1 w-5 h-5 rounded-full bg-card shadow-ambient transition-transform ${profile.available_now ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-card rounded-xl p-4 shadow-ambient text-center">
                <Heart className="h-5 w-5 text-primary mx-auto mb-1" />
                <p className="font-headline text-2xl font-bold text-foreground">{donations.length}</p>
                <p className="font-body text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Donations</p>
              </div>
              <div className="bg-card rounded-xl p-4 shadow-ambient text-center">
                <span className="text-xl block mb-1">🩸</span>
                <p className="font-headline text-2xl font-bold text-foreground">{totalUnits}</p>
                <p className="font-body text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Units</p>
              </div>
              <div className="bg-card rounded-xl p-4 shadow-ambient text-center">
                <Clock className="h-5 w-5 text-primary mx-auto mb-1" />
                <p className="font-body text-sm font-bold text-foreground">
                  {lastDonation ? nextEligible(lastDonation.donation_date) : "Ready"}
                </p>
                <p className="font-body text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Eligibility</p>
              </div>
            </div>

            {/* Donation timeline */}
            <div>
              <div className="flex items-center gap-4 mb-4">
                <h3 className="font-headline text-xl font-bold italic text-foreground whitespace-nowrap">Donation History</h3>
                <div className="h-[1px] flex-grow bg-border/50" />
              </div>

              {donations.length === 0 ? (
                <div className="text-center py-10 bg-accent/30 rounded-2xl">
                  <span className="text-3xl block mb-3">📖</span>
                  <p className="font-body text-sm text-muted-foreground">No donation stories written yet.</p>
                  <p className="font-body text-xs text-muted-foreground mt-1">
                    Your donation history will appear here after you help someone.
                  </p>
                  <p className="font-headline italic text-primary/60 text-xs mt-3">"Your story can become someone's survival."</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {donations.map((d, i) => (
                    <div
                      key={d.id}
                      className="bg-card rounded-xl p-4 shadow-ambient border-l-4 border-primary animate-fade-up"
                      style={{ animationDelay: `${i * 60}ms` }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5 text-primary" />
                            <span className="font-body text-sm font-bold text-foreground">
                              {new Date(d.donation_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </span>
                          </div>
                          {d.patient_name && (
                            <p className="font-body text-sm text-muted-foreground mt-1">
                              Donated to <span className="font-bold text-foreground">{d.patient_name}</span>
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground font-body flex-wrap">
                            {d.hospital && <span>{d.hospital}</span>}
                            {d.area && <span>• {d.area}</span>}
                            <span>• {d.units_donated} {d.units_donated === 1 ? "unit" : "units"}</span>
                            {d.patient_relation && d.patient_relation !== "unknown" && (
                              <span>• {d.patient_relation}</span>
                            )}
                          </div>
                          {d.donor_note && (
                            <p className="font-body text-xs text-muted-foreground italic mt-2">"{d.donor_note}"</p>
                          )}
                        </div>
                        <span className="bg-primary text-primary-foreground text-xs font-body font-bold px-2 py-0.5 rounded flex-shrink-0">
                          {d.blood_group}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Profile link */}
            {isOwner && profile.access_token && (
              <div className="bg-accent/30 rounded-2xl p-5">
                <p className="font-body text-sm font-bold text-foreground mb-1">Your Profile Link</p>
                <p className="font-body text-xs text-muted-foreground mb-3">
                  Bookmark this to access your profile anytime — no login needed.
                </p>
                <button
                  onClick={() => navigator.clipboard?.writeText(`${window.location.origin}/profile?token=${profile.access_token}`)}
                  className="w-full py-3 bg-card rounded-xl font-body font-bold text-sm text-foreground active:scale-95 transition-all shadow-ambient"
                >
                  📋 Copy My Profile Link
                </button>
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default DonorProfilePage;
