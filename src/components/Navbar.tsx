import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { CrimsonButton } from "./CrimsonButton";
import { Menu, X, UserPlus } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import LangToggle from "./LangToggle";
import { useI18n } from "@/contexts/I18nContext";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const isJoinPage = location.pathname === "/join";
  const { t } = useI18n();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/60 backdrop-blur-2xl border-b border-border/15 supports-[backdrop-filter]:bg-background/50">
      <div className="flex items-center justify-between px-5 py-3.5 lg:px-8 lg:py-4 max-w-7xl mx-auto">
        <Link to="/" className="font-headline text-xl lg:text-2xl font-bold italic text-primary tracking-tight">
          Crimson Verse
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/search" className="font-body text-[13px] font-semibold text-muted-foreground hover:text-foreground transition-colors duration-300">
            {t("nav.search")}
          </Link>
          <Link to="/urgent" className="font-body text-[13px] font-semibold text-muted-foreground hover:text-foreground transition-colors duration-300">
            {t("nav.urgent")}
          </Link>
          <Link to="/profile" className="font-body text-[13px] font-semibold text-muted-foreground hover:text-foreground transition-colors duration-300">
            {t("nav.profile")}
          </Link>
          <div className="w-px h-5 bg-border/40" />
          <div className="flex items-center gap-1.5">
            <LangToggle />
            <ThemeToggle />
          </div>
          {!isJoinPage && (
            <Link to="/join">
              <CrimsonButton size="sm" variant="primary">
                <UserPlus className="mr-1.5 h-3.5 w-3.5" />
                {t("nav.join")}
              </CrimsonButton>
            </Link>
          )}
        </nav>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-foreground p-1"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-background/95 backdrop-blur-2xl border-t border-border/15 animate-fade-in">
          <nav className="flex flex-col px-5 py-5 gap-1">
            <Link to="/search" onClick={() => setOpen(false)} className="font-body text-[15px] font-semibold text-foreground py-3 px-3 rounded-xl hover:bg-muted transition-colors">
              {t("nav.search")}
            </Link>
            <Link to="/urgent" onClick={() => setOpen(false)} className="font-body text-[15px] font-semibold text-foreground py-3 px-3 rounded-xl hover:bg-muted transition-colors">
              {t("nav.urgent")}
            </Link>
            <Link to="/profile" onClick={() => setOpen(false)} className="font-body text-[15px] font-semibold text-foreground py-3 px-3 rounded-xl hover:bg-muted transition-colors">
              {t("nav.profile")}
            </Link>
            <div className="flex items-center gap-3 py-3 px-3">
              <LangToggle />
              <ThemeToggle />
              <span className="font-body text-xs text-muted-foreground">{t("nav.theme")}</span>
            </div>
            <div className="pt-2 px-3">
              <Link to="/join" onClick={() => setOpen(false)}>
                <CrimsonButton variant="primary" className="w-full">
                  <UserPlus className="mr-2 h-4 w-4" />
                  {t("nav.join")}
                </CrimsonButton>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
