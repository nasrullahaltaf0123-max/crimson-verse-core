import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-surface-low py-12 px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        <div>
          <div className="font-headline text-xl font-bold italic text-primary mb-4">
            Crimson Verse
          </div>
          <p className="font-headline italic text-muted-foreground text-sm">
            © 2024 Crimson Verse Editorial Department. All contributions are vital stories.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <h5 className="text-xs font-body font-bold uppercase tracking-[0.2em] text-muted-foreground mb-2">
            Navigation
          </h5>
          <Link to="/search" className="font-headline italic text-muted-foreground hover:text-primary transition-colors text-sm">
            Search Donors
          </Link>
          <Link to="/urgent" className="font-headline italic text-muted-foreground hover:text-primary transition-colors text-sm">
            Urgent Requests
          </Link>
          <Link to="/join" className="font-headline italic text-muted-foreground hover:text-primary transition-colors text-sm">
            Join the Community
          </Link>
          <Link to="/dashboard" className="font-headline italic text-muted-foreground hover:text-primary transition-colors text-sm">
            Dashboard
          </Link>
        </div>

        <div>
          <h5 className="text-xs font-body font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4">
            Department
          </h5>
          <p className="text-sm text-muted-foreground font-body leading-relaxed">
            BM College, English Department<br />
            Building a community where every drop matters.
          </p>
        </div>
      </div>

      {/* Developer signature */}
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-border/30">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 justify-center text-center sm:text-left">
          <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-headline text-xl font-bold flex-shrink-0">
            MN
          </div>
          <div className="max-w-md">
            <p className="font-body text-[10px] uppercase tracking-[0.25em] text-primary font-bold mb-1">
              Crafted With Purpose
            </p>
            <p className="font-headline text-base font-bold italic text-foreground mb-1">
              MD NASRULLAH
            </p>
            <p className="font-body text-xs text-muted-foreground leading-relaxed">
              Department of English, Gov't BM College — Designed and developed to turn compassion into connection.
            </p>
            <a
              href="https://mdnasrullah.pro.bd"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 font-body text-xs font-bold text-primary hover:underline transition-colors"
            >
              mdnasrullah.pro.bd →
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
