import heroImage from "@/assets/hero-students.jpg";
import { CrimsonButton } from "./CrimsonButton";
import { Search, Heart, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";
import { useI18n } from "@/contexts/I18nContext";

const HeroSection = () => {
  const { t } = useI18n();

  return (
    <section className="relative overflow-hidden px-5 lg:px-12 pt-24 pb-12 lg:pt-36 lg:pb-28">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
        <div className="lg:col-span-7 z-10">
          <span className="inline-block px-3.5 py-1 mb-5 text-[10px] font-body font-bold uppercase tracking-[0.2em] bg-accent text-accent-foreground rounded-full">
            {t("hero.badge")}
          </span>

          <h1 className="font-headline text-[2.75rem] sm:text-5xl lg:text-7xl xl:text-8xl font-bold text-primary leading-[0.92] tracking-[-0.03em] italic mb-6 lg:mb-8">
            {t("hero.title1")}<br />{t("hero.title2")}
          </h1>

          <p className="font-headline italic text-lg lg:text-xl text-muted-foreground max-w-lg mb-8 lg:mb-10 leading-relaxed">
            {t("hero.subtitle")}{" "}
            <span className="text-primary font-semibold">{t("hero.subtitleHighlight")}</span>
            {t("hero.subtitleEnd")}
          </p>

          <div className="flex flex-wrap gap-3">
            <Link to="/join">
              <CrimsonButton variant="primary" size="lg">
                <UserPlus className="mr-2 h-5 w-5" />
                {t("hero.joinBtn")}
              </CrimsonButton>
            </Link>
            <Link to="/search">
              <CrimsonButton variant="outline">
                <Search className="mr-2 h-4 w-4" />
                {t("hero.searchBtn")}
              </CrimsonButton>
            </Link>
          </div>

          <div className="mt-10 lg:mt-14 flex items-center gap-6 border-l-[3px] border-primary/30 pl-5">
            <p className="font-headline italic text-lg lg:text-xl text-primary/60">
              "{t("hero.tagline")}"
            </p>
          </div>
        </div>

        <div className="lg:col-span-5 relative mt-4 lg:mt-0">
          <div className="relative z-10 lg:translate-x-8">
            <img
              src={heroImage}
              alt="University students collaborating in a sunlit library"
              className="w-full h-[340px] sm:h-[400px] lg:h-[560px] object-cover rounded-2xl lg:rounded-3xl shadow-elevated grayscale hover:grayscale-0 transition-all duration-700"
              width={1280}
              height={960}
            />
            <div className="absolute -bottom-5 -left-4 lg:-bottom-6 lg:-left-6 bg-primary p-5 lg:p-7 rounded-2xl shadow-premium text-primary-foreground">
              <Heart className="h-6 w-6 lg:h-7 lg:w-7 mb-2 opacity-80" />
              <div className="font-headline text-2xl lg:text-3xl font-bold leading-tight">{t("hero.tagline")}</div>
              <div className="text-[9px] uppercase tracking-[0.2em] opacity-70 font-body mt-1">{t("hero.studentDonors")}</div>
            </div>
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-accent/20 rounded-full blur-3xl -z-10" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
