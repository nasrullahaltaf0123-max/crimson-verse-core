import { Zap, BookOpen, Star } from "lucide-react";
import { useSiteStats } from "@/hooks/useSiteStats";

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  label: string;
  variant?: "default" | "highlight";
}

const StatCard = ({ icon, title, value, label, variant = "default" }: StatCardProps) => {
  return (
    <div
      className={`p-8 lg:p-10 rounded-2xl flex flex-col justify-between min-h-[260px] transition-transform duration-300 hover:-translate-y-1 ${
        variant === "highlight"
          ? "bg-primary text-primary-foreground"
          : "bg-card shadow-ambient"
      }`}
    >
      <div>
        <div className={`mb-6 ${variant === "highlight" ? "text-secondary-container" : "text-primary"}`}>
          {icon}
        </div>
        <h3 className="font-headline text-3xl lg:text-4xl font-bold">{title}</h3>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="font-headline text-5xl lg:text-7xl font-extrabold">{value}</span>
        <span className="text-sm font-body font-bold uppercase tracking-widest opacity-80">{label}</span>
      </div>
    </div>
  );
};

const StatsSection = () => {
  const { stats } = useSiteStats();

  return (
    <section className="bg-surface-low py-20 lg:py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            icon={<Zap size={28} />}
            title="Available Now"
            value={String(stats.total_donors)}
            label="Active Donors"
          />
          <StatCard
            icon={<BookOpen size={28} />}
            title="Requests Solved"
            value={stats.successful_matches > 0 ? `${stats.successful_matches}+` : "0"}
            label="Stories Continued"
            variant="highlight"
          />
          <StatCard
            icon={<Star size={28} />}
            title="Rare Blood Heroes"
            value={String(stats.rare_blood_count)}
            label="Negative Groups"
          />
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
