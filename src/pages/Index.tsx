import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import StatsSection from "@/components/StatsSection";
import QuoteStrip from "@/components/QuoteStrip";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      <Navbar />
      <main>
        <HeroSection />
        <StatsSection />
        <QuoteStrip />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
