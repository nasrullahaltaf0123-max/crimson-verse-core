import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TrustPanel from "@/components/TrustPanel";
import DonorForm from "@/components/DonorForm";
import SuccessModal from "@/components/SuccessModal";
import { CrimsonButton } from "@/components/CrimsonButton";
import joinHero from "@/assets/join-hero.jpg";

const JoinPage = () => {
  const [successOpen, setSuccessOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Editorial hero */}
      <section className="relative overflow-hidden px-6 lg:px-12 pt-28 pb-16 lg:pt-36 lg:pb-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 z-10">
            <span className="inline-block px-4 py-1.5 mb-6 text-xs font-body font-bold uppercase tracking-widest bg-secondary-container text-secondary-container-foreground rounded-full">
              Become a Donor
            </span>
            <h1 className="font-headline text-5xl sm:text-6xl lg:text-7xl font-bold text-primary leading-[0.9] tracking-tighter italic mb-6">
              Join the Circle
            </h1>
            <p className="font-headline italic text-xl lg:text-2xl text-muted-foreground max-w-xl leading-relaxed">
              Every chapter of life deserves a narrator. By registering, you become a{" "}
              <span className="text-primary font-semibold">life-saving verse</span> in someone's unfinished story.
            </p>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="relative z-10 lg:translate-x-8">
              <img
                src={joinHero}
                alt="Student donating blood in a warm medical setting"
                className="w-full h-[300px] lg:h-[420px] object-cover rounded-2xl shadow-elevated grayscale hover:grayscale-0 transition-all duration-700"
                width={960}
                height={1280}
              />
              {/* Floating urgent callout */}
              <div className="absolute -bottom-5 -left-5 bg-primary p-5 rounded-2xl shadow-elevated text-primary-foreground flex items-center gap-3 max-w-[220px]">
                <AlertTriangle className="h-6 w-6 flex-shrink-0" />
                <div>
                  <span className="text-[10px] uppercase tracking-widest font-body font-bold opacity-80 block">Urgent Need</span>
                  <span className="font-body font-bold text-sm">3 O- requests pending</span>
                </div>
              </div>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-secondary-container/20 rounded-full blur-3xl -z-10" />
          </div>
        </div>
      </section>

      {/* Main content: trust panel + form */}
      <section className="bg-surface-low py-16 lg:py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Trust panel — sidebar */}
          <div className="lg:col-span-4 order-2 lg:order-1">
            <div className="lg:sticky lg:top-28">
              <TrustPanel />
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-8 order-1 lg:order-2">
            <div className="bg-card rounded-3xl p-6 sm:p-10 shadow-ambient">
              <DonorForm onSuccess={() => setSuccessOpen(true)} />
            </div>

            {/* Trust note below form */}
            <p className="text-center font-body text-xs text-muted-foreground mt-6">
              🔒 Your information is securely encrypted and only visible to verified members of the Crimson Verse community.
            </p>
          </div>
        </div>
      </section>

      {/* Quote footer strip */}
      <section className="bg-accent/30 py-14 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-headline italic text-2xl lg:text-3xl text-primary/70 leading-relaxed">
            "Your blood, someone's next chapter."
          </p>
          <span className="font-body text-xs text-muted-foreground mt-3 block uppercase tracking-widest">— Crimson Verse</span>
        </div>
      </section>

      <Footer />

      {/* Mobile sticky submit */}
      <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-background/90 backdrop-blur-xl border-t border-border/30 px-6 py-3 z-40">
        <CrimsonButton variant="primary" className="w-full" onClick={() => {
          const form = document.querySelector('[data-form-submit]') as HTMLButtonElement;
          form?.click();
        }}>
          Join as Verified Donor
        </CrimsonButton>
      </div>

      <SuccessModal open={successOpen} onClose={() => setSuccessOpen(false)} />
    </div>
  );
};

export default JoinPage;
