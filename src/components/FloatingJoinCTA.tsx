import { Plus } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const FloatingJoinCTA = () => {
  const location = useLocation();
  const isJoin = location.pathname === "/join";
  const isUrgent = location.pathname === "/urgent";

  return (
    <>
      {/* Emergency CTA — mobile thumb zone, all pages except /urgent (which has its own) */}
      {!isUrgent && (
        <div className="fixed bottom-0 left-0 right-0 lg:hidden z-40 px-4 py-3 bg-background/95 backdrop-blur-xl border-t border-border/30">
          <Link
            to="/urgent"
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-br from-primary to-primary-container text-primary-foreground font-body font-bold text-sm py-3.5 rounded-xl shadow-elevated active:scale-95 transition-all tracking-wide uppercase"
          >
            🚨 Urgent Blood Needed
          </Link>
        </div>
      )}

      {/* Join CTA — floating pill, desktop + mobile (hidden on /join and /urgent mobile) */}
      {!isJoin && (
        <Link
          to="/join"
          className="fixed bottom-20 right-6 lg:bottom-6 z-40 flex items-center gap-2 bg-gradient-to-br from-primary to-primary-container text-primary-foreground pl-4 pr-5 py-3.5 rounded-full shadow-elevated hover:shadow-[0_20px_60px_-12px_hsl(358_95%_20%_/_0.25)] transition-all duration-300 active:scale-95 font-body font-bold text-sm tracking-wide group"
        >
          <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
          <span className="hidden sm:inline">Add My Blood Info</span>
          <span className="sm:hidden">Join</span>
        </Link>
      )}
    </>
  );
};

export default FloatingJoinCTA;
