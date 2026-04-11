import { useState } from "react";
import { AlertTriangle, Shield, Clock, Users } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import QuickDonorForm, { type QuickDonorData } from "@/components/QuickDonorForm";
import ViralSuccessModal from "@/components/ViralSuccessModal";
import joinHero from "@/assets/join-hero.jpg";

const JoinPage = () => {
  const [successData, setSuccessData] = useState<{ name: string; blood: string } | null>(null);

  const handleSuccess = (data: QuickDonorData) => {
    setSuccessData({ name: data.fullName, blood: data.bloodGroup });
  };

  return (
    <div className="min-h-screen bg-background pb-16 lg:pb-0">
      <Navbar />

      {/* Compact editorial hero */}
      <section className="relative overflow-hidden px-6 pt-24 pb-8 lg:pt-32 lg:pb-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 z-10">
            <span className="inline-block px-4 py-1.5 mb-4 text-xs font-body font-bold uppercase tracking-widest bg-secondary-container text-secondary-container-foreground rounded-full">
              Takes 30 Seconds
            </span>
            <h1 className="font-headline text-4xl sm:text-5xl lg:text-6xl font-bold text-primary leading-[0.9] tracking-tighter italic mb-4">
              Join the Circle
            </h1>
            <p className="font-headline italic text-lg lg:text-xl text-muted-foreground max-w-lg leading-relaxed">
              Add your blood info so classmates can find you when they need a donor. <span className="text-primary font-semibold">It's free, instant, and saves lives.</span>
            </p>

            {/* Quick trust badges inline */}
            <div className="flex flex-wrap gap-3 mt-5">
              {[
                { icon: <Shield className="h-3 w-3" />, label: "Private & Safe" },
                { icon: <Clock className="h-3 w-3" />, label: "30 Seconds" },
                { icon: <Users className="h-3 w-3" />, label: "Students Only" },
              ].map((b) => (
                <span key={b.label} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-card rounded-full text-[10px] font-body font-bold uppercase tracking-widest text-muted-foreground shadow-ambient">
                  <span className="text-primary">{b.icon}</span>
                  {b.label}
                </span>
              ))}
            </div>
          </div>

          <div className="hidden lg:block lg:col-span-5 relative">
            <div className="relative z-10 lg:translate-x-8">
              <img
                src={joinHero}
                alt="Student donating blood"
                className="w-full h-[320px] object-cover rounded-2xl shadow-elevated grayscale hover:grayscale-0 transition-all duration-700"
                loading="lazy"
                width={960}
                height={1280}
              />
              <div className="absolute -bottom-4 -left-4 bg-primary p-4 rounded-xl shadow-elevated text-primary-foreground flex items-center gap-2.5">
                <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                <div>
                  <span className="text-[10px] uppercase tracking-widest font-body font-bold opacity-80 block">Urgent</span>
                  <span className="font-body font-bold text-sm">3 O- needed now</span>
                </div>
              </div>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-secondary-container/20 rounded-full blur-3xl -z-10" />
          </div>
        </div>
      </section>

      {/* Form section */}
      <section className="px-6 py-8 lg:py-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-card rounded-3xl p-5 sm:p-8 shadow-ambient">
            <QuickDonorForm onSuccess={handleSuccess} />
          </div>
        </div>
      </section>

      {/* Quote strip */}
      <section className="bg-accent/30 py-10 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-headline italic text-xl lg:text-2xl text-primary/70 leading-relaxed">
            "Your blood, someone's next chapter."
          </p>
        </div>
      </section>

      <Footer />

      <ViralSuccessModal
        open={!!successData}
        onClose={() => setSuccessData(null)}
        donorName={successData?.name || ""}
        bloodGroup={successData?.blood || ""}
      />
    </div>
  );
};

export default JoinPage;
