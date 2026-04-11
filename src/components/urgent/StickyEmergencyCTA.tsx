interface Props {
  onPost: () => void;
}

const StickyEmergencyCTA = ({ onPost }: Props) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-background/95 backdrop-blur-xl border-t border-border/30 px-4 py-3 z-40">
      <button
        onClick={onPost}
        className="w-full bg-gradient-to-br from-primary to-primary-container text-primary-foreground font-body font-bold text-sm py-3.5 rounded-xl shadow-elevated active:scale-95 transition-all tracking-wide uppercase"
      >
        🚨 Post Emergency Request
      </button>
    </div>
  );
};

export default StickyEmergencyCTA;
