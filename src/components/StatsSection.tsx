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
  const { t } = useI18n();

  return (
    <section className="bg-surface-low py-20 lg:py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            icon={<Zap size={28} />}
            title={t("stats.availableNow")}
            value={String(stats.total_donors)}
            label={t("stats.activeDonors")}
          />
          <StatCard
            icon={<BookOpen size={28} />}
            title={t("stats.requestsSolved")}
            value={stats.successful_matches > 0 ? `${stats.successful_matches}+` : "0"}
            label={t("stats.storiesContinued")}
            variant="highlight"
          />
          <StatCard
            icon={<Star size={28} />}
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
