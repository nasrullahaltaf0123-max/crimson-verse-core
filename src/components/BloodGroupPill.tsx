import { cn } from "@/lib/utils";

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;
export type BloodGroup = (typeof bloodGroups)[number];

interface BloodGroupPillProps {
  group: BloodGroup;
  active?: boolean;
  size?: "sm" | "md";
  onClick?: () => void;
  className?: string;
}

const BloodGroupPill = ({ group, active = false, size = "md", onClick, className }: BloodGroupPillProps) => {
  const isNegative = group.includes("-");

  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center font-body font-bold uppercase tracking-wider transition-all duration-200 active:scale-95 rounded-full",
        size === "md" ? "px-4 py-2 text-sm" : "px-3 py-1.5 text-xs",
        active
          ? "bg-primary text-primary-foreground shadow-ambient"
          : isNegative
            ? "bg-accent text-accent-foreground hover:bg-primary hover:text-primary-foreground"
            : "bg-secondary-container text-secondary-container-foreground hover:bg-primary hover:text-primary-foreground",
        className
      )}
    >
      {group}
    </button>
  );
};

export { BloodGroupPill, bloodGroups };
