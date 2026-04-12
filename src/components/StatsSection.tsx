import { Zap, BookOpen, Star } from "lucide-react";
import { useSiteStats } from "@/hooks/useSiteStats";
import { useI18n } from "@/contexts/I18nContext";

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
      className={`p-7 lg:p-9 rounded-2xl flex flex-col justify-between min-h-[220px] lg:min-h-[260px] hover-lift ${
        variant === "highlight"
          ? "bg-primary text-primary-foreground"
          : "bg-card shadow-ambient"
      }`}
    >
      <div>
        <div className={`mb-5 ${variant === "highlight" ? "text-primary-foreground/70" : "text-primary"}`}>
          {icon}
        </div>
        <h3 className="font-headline text-2xl lg:text-3xl font-bold leading-tight">{title}</h3>
      </div>
      <div className="flex items-baseline gap-2 mt-4">
        <span className="font-headline text-4xl lg:text-6xl font-extrabold tracking-tight">{value}</span>
        <span className="text-[10px] font-body font-bold uppercase tracking-[0.15em] opacity-70">{label}</span>
      </div>
    </div>
  );
};

const StatsSection = () => {
  const { stats } = useSiteStats();
  const { t } = useI18n();

  return (
    <section className="bg-surface-low py-16 lg:py-24 px-5 lg:px-8 section-fade">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
          <StatCard
            icon={<Zap size={26} />}
            title={t("stats.availableNow")}
            value={String(stats.total_donors)}
            label={t("stats.activeDonors")}
          />
          <StatCard
            icon={<BookOpen size={26} />}
            title={t("stats.requestsSolved")}
            value={stats.successful_matches > 0 ? `${stats.successful_matches}+` : "0"}
            label={t("stats.storiesContinued")}
            variant="highlight"
          />
          <StatCard
            icon={<Star size={26} />}
            title={t("stats.rareHeroes")}
            value={String(stats.rare_blood_count)}
            label={t("stats.negativeGroups")}
          />
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
