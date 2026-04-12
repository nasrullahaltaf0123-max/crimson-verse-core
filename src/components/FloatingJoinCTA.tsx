import { Plus } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useI18n } from "@/contexts/I18nContext";

const FloatingJoinCTA = () => {
  const location = useLocation();
  const isJoin = location.pathname === "/join";
  const isUrgent = location.pathname === "/urgent";
  const { t } = useI18n();

  return (
    <>
      {!isUrgent && !isJoin && (
        <div className="fixed bottom-0 left-0 right-0 lg:hidden z-40 px-4 pb-[env(safe-area-inset-bottom,8px)] pt-3 bg-background/90 backdrop-blur-2xl border-t border-border/15 pointer-events-none">
          <Link
            to="/urgent"
            tabIndex={-1}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-br from-primary to-primary-container text-primary-foreground font-body font-bold text-[13px] py-3.5 rounded-2xl shadow-elevated active:scale-[0.97] transition-all duration-300 tracking-[0.08em] uppercase pointer-events-auto"
          >
            🚨 {t("cta.urgentBlood")}
          </Link>
        </div>
      )}

      {!isJoin && (
        <Link
          to="/join"
          tabIndex={-1}
          className="fixed bottom-[72px] right-5 lg:bottom-6 lg:right-6 z-40 flex items-center gap-2 bg-gradient-to-br from-primary to-primary-container text-primary-foreground pl-4 pr-5 py-3 rounded-full shadow-premium hover:shadow-[0_20px_60px_-12px_hsl(358_95%_20%_/_0.3)] transition-all duration-500 active:scale-[0.95] font-body font-bold text-[13px] tracking-wide group"
        >
          <Plus className="h-4.5 w-4.5 group-hover:rotate-90 transition-transform duration-500" />
          <span className="hidden sm:inline">{t("cta.addBlood")}</span>
          <span className="sm:hidden">{t("cta.join")}</span>
        </Link>
      )}
    </>
  );
};

export default FloatingJoinCTA;
