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
}

interface DonorCardProps {
  donor: Donor;
  className?: string;
}

const rareGroups: BloodGroup[] = ["AB-", "B-", "A-", "O-"];

const DonorCard = ({ donor, className }: DonorCardProps) => {
  const isRare = rareGroups.includes(donor.bloodGroup);

  return (
    <article
      className={cn(
        "bg-card rounded-2xl overflow-hidden shadow-ambient hover:shadow-elevated transition-all duration-500 group",
        isRare ? "border-l-4 border-primary" : "border-l-4 border-border",
        className
      )}
    >
      <div className="p-6">
        <div className="flex gap-4">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-surface-container flex-shrink-0 relative">
            <div className="w-full h-full bg-muted flex items-center justify-center font-headline text-2xl font-bold text-muted-foreground">
              {donor.name.charAt(0)}
            </div>
            <div className="absolute top-1 right-1 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 font-bold rounded font-body">
              {donor.bloodGroup}
            </div>
          </div>

          <div className="flex flex-col justify-center min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-headline text-lg font-bold text-foreground truncate">{donor.name}</h3>
              {isRare && (
                <span className="text-[9px] font-body font-bold uppercase tracking-widest bg-accent text-accent-foreground px-2 py-0.5 rounded-full whitespace-nowrap">
                  Rare
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground font-body">{donor.batch} • English Dept</p>
            <div className="mt-1.5 flex items-center gap-1.5">
              <Clock className="h-3 w-3 text-primary" />
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-body">
                {donor.lastDonated}
              </span>
            </div>
          </div>
        </div>

        {/* Availability indicator */}
        <div className="mt-4 flex items-center gap-2">
          <div className={cn(
            "w-2 h-2 rounded-full",
            donor.available ? "bg-green-500 animate-pulse" : "bg-muted-foreground/40"
          )} />
          <span className="text-xs font-body font-medium text-muted-foreground">
            {donor.available ? "Available Now" : "Unavailable"}
          </span>
        </div>

        {/* Action buttons */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <a
            href={`https://wa.me/${donor.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-3 bg-muted hover:bg-surface-high rounded-lg text-sm font-bold text-foreground transition-colors font-body active:scale-95"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </a>
          <a
            href={`tel:${donor.phone}`}
            className="flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground rounded-lg text-sm font-bold transition-all font-body active:scale-95 hover:shadow-elevated"
          >
            <Phone className="h-4 w-4" />
            Call
          </a>
        </div>
      </div>
    </article>
  );
};

export default DonorCard;
