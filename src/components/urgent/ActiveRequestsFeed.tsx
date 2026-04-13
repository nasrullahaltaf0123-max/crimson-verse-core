import { Phone, MessageCircle, Clock, CheckCircle, AlertTriangle, MapPin } from "lucide-react";
import { waLink } from "@/lib/phoneUtils";
import type { EmergencyRequest } from "@/pages/UrgentPage";

interface Props {
  requests: EmergencyRequest[];
  loading: boolean;
  onMarkSolved: (id: string) => void;
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

const urgencyStyles = {
  critical: "border-primary bg-primary/5",
  urgent: "border-primary/50 bg-accent/20",
  moderate: "border-border bg-card",
};

const urgencyBadge = {
  critical: "bg-primary text-primary-foreground",
  urgent: "bg-primary/80 text-primary-foreground",
  moderate: "bg-accent text-accent-foreground",
};

const ActiveRequestsFeed = ({ requests, loading, onMarkSolved }: Props) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-card rounded-2xl p-6 animate-pulse">
            <div className="h-4 bg-muted rounded w-1/3 mb-3" />
            <div className="h-3 bg-muted rounded w-2/3 mb-2" />
            <div className="h-3 bg-muted rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-accent/50 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-primary/50" />
        </div>
        <p className="font-headline text-2xl italic text-muted-foreground mb-2">All Clear</p>
        <p className="font-body text-sm text-muted-foreground">No active emergency requests right now.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <h2 className="font-headline text-2xl font-bold italic text-foreground whitespace-nowrap">Active Requests</h2>
        <div className="h-[1px] flex-grow bg-border/50" />
        <span className="font-body text-xs font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
          {requests.length} Active
        </span>
      </div>

      <div className="space-y-4">
        {requests.map((req, i) => (
          <article
            key={req.id}
            className={`rounded-2xl border-l-4 p-5 sm:p-6 shadow-ambient transition-all duration-300 animate-fade-up ${urgencyStyles[req.urgency_level]}`}
            style={{ animationDelay: `${i * 60}ms` }}
          >
            {/* Header row */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className={`text-xs font-body font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${urgencyBadge[req.urgency_level]}`}>
                  {req.urgency_level}
                </span>
                <span className="bg-primary text-primary-foreground text-sm font-body font-bold px-2.5 py-0.5 rounded">
                  {req.blood_group}
                </span>
                {req.is_pinned && (
                  <span className="text-[10px] font-body font-bold uppercase tracking-widest text-primary">📌 Pinned</span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground flex-shrink-0">
                <Clock className="h-3 w-3" />
                <span className="text-[10px] font-body font-bold uppercase tracking-widest">{timeAgo(req.created_at)}</span>
              </div>
            </div>

            {/* Patient info */}
            <h4 className="font-headline text-lg font-bold text-foreground mb-1">
              {req.patient_name} — {req.units_needed} {req.units_needed === 1 ? "unit" : "units"} needed
            </h4>

            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground font-body mb-4">
              <span className="flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5 text-primary" />
                {req.hospital}
              </span>
              {req.current_area && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {req.current_area}
                </span>
              )}
            </div>

            {req.notes && (
              <p className="font-body text-sm text-muted-foreground bg-background/50 rounded-xl px-4 py-3 mb-4 italic">
                "{req.notes}"
              </p>
            )}

            {/* Action buttons */}
            <div className="flex gap-3">
              <a
                href={waLink(req.contact_number)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 bg-muted hover:bg-surface-high rounded-lg text-sm font-bold text-foreground transition-colors font-body active:scale-95"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
              <a
                href={`tel:${req.contact_number}`}
                className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-bold transition-all font-body active:scale-95 hover:shadow-elevated"
              >
                <Phone className="h-4 w-4" />
                Call Now
              </a>
              <button
                onClick={() => onMarkSolved(req.id)}
                className="ml-auto flex items-center gap-1.5 px-3 py-2.5 text-xs font-body font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
              >
                <CheckCircle className="h-3.5 w-3.5" />
                Solved
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default ActiveRequestsFeed;
