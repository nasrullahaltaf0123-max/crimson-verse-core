import { Plus } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const FloatingJoinCTA = () => {
  const location = useLocation();
  if (location.pathname === "/join") return null;

  return (
    <Link
      to="/join"
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-gradient-to-br from-primary to-primary-container text-primary-foreground pl-4 pr-5 py-3.5 rounded-full shadow-elevated hover:shadow-[0_20px_60px_-12px_hsl(358_95%_20%_/_0.25)] transition-all duration-300 active:scale-95 font-body font-bold text-sm tracking-wide group"
    >
      <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
      <span>Add My Blood Info</span>
    </Link>
  );
};

export default FloatingJoinCTA;
