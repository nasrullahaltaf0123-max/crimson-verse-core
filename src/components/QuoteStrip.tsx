import { useI18n } from "@/contexts/I18nContext";
import { useSiteStats } from "@/hooks/useSiteStats";
import { Link } from "react-router-dom";

const QuoteStrip = () => {
  const { t } = useI18n();
  const { stats } = useSiteStats();

  const totalDonors = stats.total_donors;
  const goal = 100;
  const progress = Math.min((totalDonors / goal) * 100, 100);

  return (
    <section className="py-16 lg:py-24 px-5 lg:px-8 overflow-hidden section-fade">
      <div className="max-w-7xl mx-auto relative bg-accent/30 rounded-3xl p-8 lg:p-16 overflow-hidden">
        <div className="absolute top-0 right-0 w-72 lg:w-96 h-72 lg:h-96 bg-primary/4 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10 lg:gap-16">
          <div className="max-w-xl flex-1">
            <h2 className="font-headline text-3xl lg:text-5xl font-bold text-primary mb-5 leading-tight">
              {t("quote.title")}
            </h2>
            <p className="text-sm lg:text-base text-muted-foreground mb-8 font-body leading-relaxed max-w-md">
              {t("quote.desc")}
            </p>
            <div className="w-full h-2.5 bg-secondary-container rounded-full overflow-hidden relative">
              <div
                className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${progress}%`, boxShadow: "0 0 12px hsl(358 95% 20% / 0.35)" }}
              />
            </div>
            <div className="mt-3 flex justify-between font-body font-bold text-xs tracking-[0.1em] uppercase text-muted-foreground">
              <span>{totalDonors} {t("quote.donorsJoined")}</span>
              <span className="text-primary">{t("quote.goal")}: {goal}</span>
            </div>
          </div>

          <div className="glass-panel p-7 rounded-2xl shadow-elevated w-full lg:w-80 flex-shrink-0">
            <div className="text-primary mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 19H5c-1 0-2-1-2-2V7c0-1 1-2 2-2h3"/><path d="M16 19h3c1 0 2-1 2-2V7c0-1-1-2-2-2h-3"/><path d="M12 4v16"/><path d="m9 8 3-4 3 4"/></svg>
            </div>
            <h4 className="font-body font-bold text-base mb-1.5">{t("quote.emergencyHub")}</h4>
            <p className="text-[13px] text-muted-foreground mb-5 font-body leading-relaxed">
              {t("quote.emergencyDesc")}
            </p>
            <Link
              to="/urgent"
              className="w-full py-3 bg-primary text-primary-foreground font-body font-bold rounded-xl uppercase text-[11px] tracking-[0.15em] hover:shadow-elevated transition-all duration-300 active:scale-[0.97] block text-center"
            >
              {t("quote.openSOS")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default QuoteStrip;
