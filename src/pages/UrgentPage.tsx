import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EmergencyHero from "@/components/urgent/EmergencyHero";
import EmergencyRequestForm from "@/components/urgent/EmergencyRequestForm";
import ActiveRequestsFeed from "@/components/urgent/ActiveRequestsFeed";
import EmergencySuccessModal from "@/components/urgent/EmergencySuccessModal";
import StickyEmergencyCTA from "@/components/urgent/StickyEmergencyCTA";

export interface EmergencyRequest {
  id: string;
  patient_name: string;
  blood_group: string;
  units_needed: number;
  hospital: string;
  contact_number: string;
  deadline: string | null;
  urgency_level: "critical" | "urgent" | "moderate";
  current_area: string | null;
  notes: string | null;
  doctor_note: string | null;
  ward_cabin: string | null;
  replacement_needed: boolean | null;
  donor_preference: string | null;
  gender_preference: string | null;
  additional_instructions: string | null;
  status: "active" | "solved" | "expired";
  is_pinned: boolean | null;
  solved_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

const UrgentPage = () => {
  const [requests, setRequests] = useState<EmergencyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [successData, setSuccessData] = useState<{ patientName: string; bloodGroup: string; area?: string } | null>(null);

  const fetchRequests = async () => {
    const { data, error } = await supabase
      .from("emergency_requests")
      .select("*")
      .in("status", ["active"])
      .order("is_pinned", { ascending: false })
      .order("urgency_level", { ascending: true })
      .order("created_at", { ascending: false });

    if (!error && data) {
      setRequests(data as unknown as EmergencyRequest[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();

    const channel = supabase
      .channel("emergency-feed")
      .on("postgres_changes", { event: "*", schema: "public", table: "emergency_requests" }, () => {
        fetchRequests();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const activeCount = requests.filter((r) => r.status === "active").length;
  const criticalCount = requests.filter((r) => r.urgency_level === "critical" && r.status === "active").length;

  const handleFormSuccess = (patientName: string, bloodGroup: string, area?: string) => {
    setShowForm(false);
    setSuccessData({ patientName, bloodGroup, area });
    fetchRequests();
  };

  const handleMarkSolved = async (id: string) => {
    await supabase
      .from("emergency_requests")
      .update({ status: "solved" as any, solved_at: new Date().toISOString() })
      .eq("id", id);
    fetchRequests();
  };

  const formRef = document.getElementById("emergency-form");
  const scrollToForm = () => {
    if (showForm && formRef) {
      formRef.scrollIntoView({ behavior: "smooth" });
    } else {
      setShowForm(true);
      setTimeout(() => {
        document.getElementById("emergency-form")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      <Navbar />

      <EmergencyHero
        activeCount={activeCount}
        criticalCount={criticalCount}
        onPostRequest={scrollToForm}
      />

      {/* Form section */}
      <div id="emergency-form">
        {showForm && (
          <section className="px-4 sm:px-6 py-8">
            <div className="max-w-2xl mx-auto">
              <div className="bg-card rounded-3xl p-5 sm:p-8 shadow-ambient">
                <EmergencyRequestForm onSuccess={handleFormSuccess} onCancel={() => setShowForm(false)} />
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Active requests feed */}
      <section className="px-4 sm:px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <ActiveRequestsFeed
            requests={requests}
            loading={loading}
            onMarkSolved={handleMarkSolved}
          />
        </div>
      </section>

      {/* Trust & Safety */}
      <section className="bg-surface-low py-10 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h3 className="font-headline text-xl font-bold italic text-foreground mb-4">Trust & Safety</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: "🛡️", label: "Student Verified", desc: "Only BM College students post here" },
              { icon: "🚫", label: "Spam Protected", desc: "False requests are flagged & removed" },
              { icon: "✅", label: "Solved Tracking", desc: "Requests auto-archive when fulfilled" },
            ].map((t) => (
              <div key={t.label} className="bg-card rounded-2xl p-5 shadow-ambient">
                <span className="text-2xl block mb-2">{t.icon}</span>
                <p className="font-body text-sm font-bold text-foreground">{t.label}</p>
                <p className="font-body text-xs text-muted-foreground mt-1">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quote */}
      <section className="bg-accent/30 py-10 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-headline italic text-xl lg:text-2xl text-primary/70 leading-relaxed">
            "Every second counts. Every drop matters."
          </p>
        </div>
      </section>

      <Footer />

      <StickyEmergencyCTA onPost={scrollToForm} />

      <EmergencySuccessModal
        open={!!successData}
        onClose={() => setSuccessData(null)}
        patientName={successData?.patientName || ""}
        bloodGroup={successData?.bloodGroup || ""}
        area={successData?.area}
      />
    </div>
  );
};

export default UrgentPage;
