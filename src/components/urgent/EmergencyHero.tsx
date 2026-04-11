import { AlertTriangle, Activity, Zap } from "lucide-react";
import { CrimsonButton } from "@/components/CrimsonButton";

interface EmergencyHeroProps {
  activeCount: number;
  criticalCount: number;
  onPostRequest: () => void;
}

const EmergencyHero = ({ activeCount, criticalCount, onPostRequest }: EmergencyHeroProps) => {
  return (
    <section className="relative overflow-hidden px-4 sm:px-6 pt-24 pb-8 lg:pt-32 lg:pb-12">
      {/* Pulsing background accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-3xl -z-10" />

      <div className="max-w-4xl mx-auto">
        {/* Critical alert banner */}
        {criticalCount > 0 && (
          <div className="flex items-center gap-3 bg-primary/10 border border-primary/20 rounded-xl px-4 py-3 mb-6 animate-fade-in">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse flex-shrink-0" />
            <AlertTriangle className="h-4 w-4 text-primary flex-shrink-0" />
            <p className="font-body text-sm text-foreground">
              <span className="font-bold">{criticalCount} critical</span> {criticalCount === 1 ? "request" : "requests"} need immediate donors
            </p>
          </div>
        )}

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 mb-4 text-[10px] font-body font-bold uppercase tracking-widest bg-primary text-primary-foreground rounded-full">
              <Zap className="h-3 w-3" />
              Emergency Line
            </span>
            <h1 className="font-headline text-4xl sm:text-5xl lg:text-6xl font-bold text-primary tracking-tight leading-none mb-4 italic">
              Urgent Lines
            </h1>
            <p className="text-lg lg:text-xl text-muted-foreground font-headline italic leading-relaxed">
              When time is the enemy, your classmates become heroes. Post an emergency blood request and let the circle respond.
            </p>
          </div>

          <div className="flex flex-col gap-3 self-start lg:self-end">
            <div className="bg-primary text-primary-foreground px-5 py-4 rounded-xl flex items-center gap-3 shadow-elevated">
              <Activity className="h-5 w-5" />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-widest font-bold font-body opacity-80">Live Now</span>
                <span className="font-bold font-body">{activeCount} Active {activeCount === 1 ? "Request" : "Requests"}</span>
              </div>
            </div>

            <CrimsonButton variant="primary" size="lg" onClick={onPostRequest} className="w-full">
              🚨 Post Emergency Request
            </CrimsonButton>
          </div>
        </div>

        {/* Rare blood banner */}
        <div className="mt-8 bg-accent/50 rounded-2xl p-4 sm:p-5 flex items-start gap-3">
          <div className="bg-primary text-primary-foreground text-xs font-body font-bold px-2 py-1 rounded flex-shrink-0">RARE</div>
          <div>
            <p className="font-body text-sm font-bold text-foreground">Rare blood groups always in demand</p>
            <p className="font-body text-xs text-muted-foreground mt-0.5">AB−, B−, A−, O− donors — your blood is irreplaceable. Stay available.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EmergencyHero;
