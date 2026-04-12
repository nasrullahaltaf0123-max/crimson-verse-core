import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Phone, MessageCircle, Copy, Check, MapPin } from "lucide-react";
import { rankDonors, getDonorBadges } from "@/lib/donorRanking";

interface MatchedDonor {
  id: string;
  full_name: string;
  blood_group: string;
  phone: string;
  current_area: string | null;
  available_now: boolean;
  last_donation_date: string | null;
  created_at: string;
}

interface Props {
  bloodGroup: string;
  area?: string;
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

const DonorMatchPreview = ({ bloodGroup, area }: Props) => {
  const [donors, setDonors] = useState<MatchedDonor[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("donors")
        .select("id, full_name, blood_group, phone, current_area, available_now, last_donation_date, created_at")
        .eq("blood_group", bloodGroup)
        .eq("approval_status", "approved")
        .order("available_now", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(6);

      if (data) {
        const ranked = rankDonors(
          data.map(d => ({ ...d, donation_count: 0 })),
          { targetBloodGroup: bloodGroup, targetArea: area }
        );
        setDonors(ranked);
      }
      setLoading(false);
    };

    if (bloodGroup) fetchMatches();
  }, [bloodGroup, area]);

  const handleCopy = (phone: string, id: string) => {
    navigator.clipboard?.writeText(phone);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="bg-card rounded-xl p-4 animate-pulse">
            <div className="h-4 bg-muted rounded w-1/3 mb-2" />
            <div className="h-3 bg-muted rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (donors.length === 0) {
    return (
      <div className="text-center py-6 bg-accent/30 rounded-2xl">
        <p className="font-body text-sm text-muted-foreground">No {bloodGroup} donors registered yet.</p>
        <p className="font-body text-xs text-muted-foreground mt-1">Share the request in your class group!</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <span className="bg-primary text-primary-foreground text-xs font-body font-bold px-2.5 py-1 rounded">
          {bloodGroup}
        </span>
        <h4 className="font-headline text-lg font-bold italic text-foreground">
          {donors.length} Matching {donors.length === 1 ? "Donor" : "Donors"}
        </h4>
      </div>

      <div className="space-y-3">
        {donors.map((d, i) => (
          <div
            key={d.id}
            className={`bg-card rounded-xl p-4 shadow-ambient animate-fade-up ${
              d.available_now ? "border-l-4 border-primary" : "border-l-4 border-border"
            }`}
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-body font-bold text-foreground text-sm truncate">{d.full_name}</span>
                  {getDonorBadges({ ...d, donation_count: 0 }, i).map((b) => (
                    <span key={b} className="text-[8px] font-body font-bold uppercase tracking-widest bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
                      {b}
                    </span>
                  ))}
                  {d.available_now && (
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      <span className="text-[10px] font-body font-bold text-primary uppercase tracking-widest">Available</span>
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground font-body">
                  {d.current_area && (
                    <span className="flex items-center gap-0.5">
                      <MapPin className="h-3 w-3" />
                      {d.current_area}
                    </span>
                  )}
                  <span>Joined {timeAgo(d.created_at)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => handleCopy(d.phone, d.id)}
                  className="p-2.5 bg-muted rounded-lg hover:bg-surface-high transition-colors active:scale-95"
                  title="Copy number"
                >
                  {copiedId === d.id ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
                </button>
                <a
                  href={`https://wa.me/${d.phone.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 bg-muted rounded-lg hover:bg-surface-high transition-colors active:scale-95"
                >
                  <MessageCircle className="h-4 w-4 text-foreground" />
                </a>
                <a
                  href={`tel:${d.phone}`}
                  className="p-2.5 bg-primary text-primary-foreground rounded-lg active:scale-95 transition-all hover:shadow-elevated"
                >
                  <Phone className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DonorMatchPreview;
