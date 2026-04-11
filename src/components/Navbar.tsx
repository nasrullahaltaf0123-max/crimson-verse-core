import { useState } from "react";
import { Link } from "react-router-dom";
import { CrimsonButton } from "./CrimsonButton";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/70 backdrop-blur-xl border-b border-border/30">
      <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <Link to="/" className="font-headline text-2xl font-bold italic text-primary tracking-tight">
          Crimson Verse
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link to="/search" className="font-body text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Search Donors
          </Link>
          <Link to="/urgent" className="font-body text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Urgent Requests
          </Link>
          <Link to="/join" className="font-body text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Join Us
          </Link>
          <CrimsonButton size="sm" variant="primary">
            Request Blood
          </CrimsonButton>
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
            <Link to="/join" onClick={() => setOpen(false)} className="font-body text-base font-medium text-foreground py-2">
              Join Us
            </Link>
            <CrimsonButton variant="primary" className="mt-2">
              Request Blood
            </CrimsonButton>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
