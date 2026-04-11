const QuoteStrip = () => {
  return (
    <section className="py-20 lg:py-24 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto relative bg-accent/40 rounded-3xl p-10 lg:p-20 overflow-hidden">
        {/* Ambient blob */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="max-w-xl">
            <h2 className="font-headline text-4xl lg:text-5xl font-bold text-primary mb-6">
              The English Department Pulse
            </h2>
            <p className="text-base lg:text-lg text-muted-foreground mb-8 font-body">
              Tracking our community's contribution toward the annual blood drive goal. Every unit donated is a line in our shared history.
            </p>
            {/* Progress bar */}
            <div className="w-full h-3 bg-secondary-container rounded-full overflow-hidden relative">
              <div
                className="absolute top-0 left-0 h-full bg-primary rounded-full"
                style={{ width: "72%", boxShadow: "0 0 15px hsl(358 95% 20% / 0.4)" }}
              />
            </div>
            <div className="mt-4 flex justify-between font-body font-bold text-sm tracking-widest uppercase">
              <span>720 Pints Collected</span>
              <span className="text-primary">Goal: 1000</span>
            </div>
          </div>

          {/* Glassmorphism card */}
          <div className="backdrop-blur-md bg-card/70 p-8 rounded-2xl shadow-elevated border border-border/30 w-full lg:w-80">
            <div className="text-primary mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 19H5c-1 0-2-1-2-2V7c0-1 1-2 2-2h3"/><path d="M16 19h3c1 0 2-1 2-2V7c0-1-1-2-2-2h-3"/><path d="M12 4v16"/><path d="m9 8 3-4 3 4"/></svg>
            </div>
            <h4 className="font-body font-bold text-lg mb-2">Emergency Hub</h4>
            <p className="text-sm text-muted-foreground mb-6 font-body">
              Immediate access to rare blood group contacts and emergency logistics.
            </p>
            <button className="w-full py-3 bg-primary text-primary-foreground font-body font-bold rounded-lg uppercase text-xs tracking-widest hover:shadow-elevated transition-all active:scale-95">
              Open SOS Center
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default QuoteStrip;
