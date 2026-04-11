import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { CrimsonButton } from "./CrimsonButton";
import { Menu, X, UserPlus } from "lucide-react";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const isJoinPage = location.pathname === "/join";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/70 backdrop-blur-xl border-b border-border/30">
      <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <Link to="/" className="font-headline text-2xl font-bold italic text-primary tracking-tight">
          Crimson Verse
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/search" className="font-body text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Search Donors
          </Link>
          <Link to="/urgent" className="font-body text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Urgent
          </Link>
          {!isJoinPage && (
            <Link to="/join">
              <CrimsonButton size="sm" variant="primary">
                <UserPlus className="mr-1.5 h-3.5 w-3.5" />
                Join as Donor
              </CrimsonButton>
            </Link>
          )}
        </nav>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-foreground"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-background/95 backdrop-blur-xl border-t border-border/30 animate-fade-in">
          <nav className="flex flex-col px-6 py-6 gap-4">
            <Link to="/search" onClick={() => setOpen(false)} className="font-body text-base font-medium text-foreground py-2">
              Search Donors
            </Link>
            <Link to="/urgent" onClick={() => setOpen(false)} className="font-body text-base font-medium text-foreground py-2">
              Urgent Requests
            </Link>
            <Link to="/join" onClick={() => setOpen(false)}>
              <CrimsonButton variant="primary" className="w-full mt-2">
                <UserPlus className="mr-2 h-4 w-4" />
                Join as Donor
              </CrimsonButton>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
