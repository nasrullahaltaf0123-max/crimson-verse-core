import { cn } from "@/lib/utils";
import { Phone, MessageCircle, Clock } from "lucide-react";
import type { BloodGroup } from "./BloodGroupPill";

export interface Donor {
  id: string;
  name: string;
  bloodGroup: BloodGroup;
  batch: string;
  gender: "Male" | "Female" | "Other";
  lastDonated: string;
  available: boolean;
  phone: string;
  whatsapp: string;
  avatar?: string;
  createdAt?: string;
}

interface DonorCardProps {
  donor: Donor;
  className?: string;
}

const rareGroups: BloodGroup[] = ["AB-", "B-", "A-", "O-"];

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

const DonorCard = ({ donor, className }: DonorCardProps) => {
  const isRare = rareGroups.includes(donor.bloodGroup);

  return (
    <article
      className={cn(
        "bg-card rounded-2xl overflow-hidden shadow-ambient hover-lift group",
        isRare ? "border-l-[3px] border-primary" : "border-l-[3px] border-border/50",
        className
      )}
    >
      <div className="p-5 lg:p-6">
        <div className="flex gap-3.5">
          {/* Avatar */}
          <div className="w-14 h-14 rounded-xl overflow-hidden bg-surface-container flex-shrink-0 relative">
            <div className="w-full h-full bg-muted flex items-center justify-center font-headline text-xl font-bold text-muted-foreground">
              {donor.name.charAt(0)}
            </div>
            <div className="absolute top-0.5 right-0.5 bg-primary text-primary-foreground text-[9px] px-1.5 py-0.5 font-bold rounded font-body">
              {donor.bloodGroup}
            </div>
          </div>

          <div className="flex flex-col justify-center min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-headline text-base font-bold text-foreground truncate">{donor.name}</h3>
              {isRare && (
                <span className="text-[8px] font-body font-bold uppercase tracking-[0.15em] bg-accent text-accent-foreground px-1.5 py-0.5 rounded-full whitespace-nowrap">
                  Rare
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground font-body mt-0.5">{donor.batch} • English Dept</p>
            <div className="mt-1 flex items-center gap-1.5">
              <Clock className="h-2.5 w-2.5 text-primary" />
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider font-body">
                {donor.createdAt ? `Joined ${timeAgo(donor.createdAt)}` : donor.lastDonated}
              </span>
            </div>
          </div>
        </div>

        {/* Availability indicator */}
        <div className="mt-3.5 flex items-center gap-2">
          <div className={cn(
            "w-1.5 h-1.5 rounded-full",
            donor.available ? "bg-primary animate-pulse" : "bg-muted-foreground/30"
          )} />
          <span className="text-[11px] font-body font-medium text-muted-foreground">
            {donor.available ? "Available Now" : "Unavailable"}
          </span>
        </div>

        {/* Action buttons */}
        <div className="mt-3.5 grid grid-cols-2 gap-2.5">
          <a
            href={`https://wa.me/${donor.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 py-2.5 bg-muted hover:bg-surface-high rounded-xl text-[13px] font-bold text-foreground transition-colors duration-300 font-body active:scale-[0.97]"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            WhatsApp
          </a>
          <a
            href={`tel:${donor.phone}`}
            className="flex items-center justify-center gap-1.5 py-2.5 bg-primary text-primary-foreground rounded-xl text-[13px] font-bold transition-all duration-300 font-body active:scale-[0.97] hover:shadow-elevated"
          >
            <Phone className="h-3.5 w-3.5" />
            Call
          </a>
        </div>
      </div>
    </article>
  );
};

export default DonorCard;
