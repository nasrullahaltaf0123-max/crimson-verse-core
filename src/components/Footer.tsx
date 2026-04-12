import { Link } from "react-router-dom";
import { useI18n } from "@/contexts/I18nContext";
import { ExternalLink } from "lucide-react";
import devPhoto from "@/assets/md-nasrullah-profile.jpg";

const Footer = () => {
  const { t } = useI18n();

  return (
    <footer className="bg-surface-low">
      {/* Main footer */}
      <div className="py-14 px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-7xl mx-auto">
          <div>
            <div className="font-headline text-2xl font-bold italic text-primary mb-3">
              Crimson Verse
            </div>
            <p className="font-body text-sm text-muted-foreground leading-relaxed max-w-xs">
              {t("footer.copyright")}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h5 className="text-[10px] font-body font-bold uppercase tracking-[0.25em] text-primary mb-2">
              {t("footer.nav")}
            </h5>
            <Link to="/search" className="font-body text-sm text-muted-foreground hover:text-primary transition-colors">
              {t("footer.search")}
            </Link>
            <Link to="/urgent" className="font-body text-sm text-muted-foreground hover:text-primary transition-colors">
              {t("footer.urgent")}
            </Link>
            <Link to="/join" className="font-body text-sm text-muted-foreground hover:text-primary transition-colors">
              {t("footer.joinCommunity")}
            </Link>
            <Link to="/profile" className="font-body text-sm text-muted-foreground hover:text-primary transition-colors">
              {t("nav.profile")}
            </Link>
          </div>

          <div>
            <h5 className="text-[10px] font-body font-bold uppercase tracking-[0.25em] text-primary mb-4">
              {t("footer.dept")}
            </h5>
            <p className="text-sm text-muted-foreground font-body leading-relaxed">
              {t("footer.deptDesc")}<br />
              {t("footer.deptSubDesc")}
            </p>
          </div>
        </div>
      </div>

      {/* Developer signature — premium editorial card */}
      <div className="border-t border-border/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
          <div className="bg-card rounded-2xl p-6 sm:p-8 shadow-ambient overflow-hidden relative">
            {/* Subtle gradient accent */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-primary/60 to-transparent" />

            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Photo */}
              <div className="relative flex-shrink-0">
                <img
                  src={devPhoto}
                  alt="MD Nasrullah"
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover shadow-elevated"
                />
                <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground text-[8px] font-body font-bold uppercase tracking-widest px-2 py-1 rounded-lg shadow-ambient">
                  Dev
                </div>
              </div>

              {/* Info */}
              <div className="text-center sm:text-left flex-1">
                <p className="text-[9px] font-body font-bold uppercase tracking-[0.3em] text-primary mb-1.5">
                  {t("footer.crafted")}
                </p>
                <h4 className="font-headline text-xl sm:text-2xl font-bold italic text-foreground mb-1">
                  MD NASRULLAH
                </h4>
                <p className="font-body text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-md">
                  {t("footer.devDesc")}
                </p>
                <a
                  href="https://mdnasrullah.pro.bd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg font-body text-xs font-bold transition-colors active:scale-95"
                >
                  <ExternalLink className="h-3 w-3" />
                  {t("footer.portfolio")}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
