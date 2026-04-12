import heroImage from "@/assets/hero-students.jpg";
import { CrimsonButton } from "./CrimsonButton";
import { Search, Heart, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";
import { useI18n } from "@/contexts/I18nContext";

const HeroSection = () => {
  const { t } = useI18n();

  return (
    <section className="relative overflow-hidden px-6 lg:px-12 pt-28 pb-16 lg:pt-36 lg:pb-32">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 z-10">
          <span className="inline-block px-4 py-1.5 mb-6 text-xs font-body font-bold uppercase tracking-widest bg-secondary-container text-secondary-container-foreground rounded-full">
            {t("hero.badge")}
          </span>

          <h1 className="font-headline text-5xl sm:text-6xl lg:text-8xl font-bold text-primary leading-[0.9] tracking-tighter italic mb-8">
            {t("hero.title1")}<br />{t("hero.title2")}
          </h1>

          <p className="font-headline italic text-xl lg:text-2xl text-muted-foreground max-w-xl mb-10 leading-relaxed">
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

          <div className="mt-14 flex items-center gap-6 border-l-4 border-primary pl-6">
            <p className="font-headline italic text-xl lg:text-2xl text-primary/70">
              "{t("hero.tagline")}"
            </p>
          </div>
        </div>

        <div className="lg:col-span-5 relative">
          <div className="relative z-10 lg:translate-x-12">
            <img
              src={heroImage}
              alt="University students collaborating in a sunlit library"
              className="w-full h-[400px] lg:h-[600px] object-cover rounded-2xl shadow-elevated grayscale hover:grayscale-0 transition-all duration-700"
              width={1280}
              height={960}
            />
            <div className="absolute -bottom-6 -left-6 bg-primary p-6 lg:p-8 rounded-2xl shadow-elevated text-primary-foreground">
              <Heart className="h-8 w-8 mb-3 opacity-80" />
              <div className="font-headline text-3xl lg:text-4xl font-bold">1,240+</div>
              <div className="text-[10px] uppercase tracking-widest opacity-80 font-body">{t("hero.studentDonors")}</div>
            </div>
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-secondary-container/30 rounded-full blur-3xl -z-10" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
