interface Props {
  onPost: () => void;
}

const StickyEmergencyCTA = ({ onPost }: Props) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-background/90 backdrop-blur-2xl border-t border-border/15 px-4 pb-[env(safe-area-inset-bottom,8px)] pt-3 z-40 pointer-events-none">
      <button
        onClick={onPost}
        tabIndex={-1}
        className="w-full bg-gradient-to-br from-primary to-primary-container text-primary-foreground font-body font-bold text-[13px] py-3.5 rounded-2xl shadow-elevated active:scale-[0.97] transition-all duration-300 tracking-[0.08em] uppercase pointer-events-auto"
      >
        🚨 Post Emergency Request
      </button>
    </div>
  );
};

export default StickyEmergencyCTA;
