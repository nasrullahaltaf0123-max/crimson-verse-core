import { Shield, Eye, CheckCircle, Clock, Heart, HelpCircle } from "lucide-react";

const trustItems = [
  {
    icon: <Shield className="h-5 w-5" />,
    title: "Your Data is Protected",
    desc: "All personal and medical information is encrypted and only shared with verified requesters during emergencies.",
  },
  {
    icon: <Eye className="h-5 w-5" />,
    title: "Privacy First",
    desc: "Your contact details are hidden by default. You control who can reach you and when.",
  },
  {
    icon: <CheckCircle className="h-5 w-5" />,
    title: "Verified Community",
    desc: "Every donor is verified through their BM College student ID and blood report before listing.",
  },
];

const processSteps = [
  { step: "01", label: "Fill this form with accurate details" },
  { step: "02", label: "Upload your blood report & student ID" },
  { step: "03", label: "Our team verifies your documents" },
  { step: "04", label: "You appear as a verified donor" },
];

const eligibilityRules = [
  "Age 18–65 years",
  "Weight above 50 kg",
  "No major chronic illnesses",
  "Last donation at least 3 months ago",
  "Not currently on antibiotics",
];

const TrustPanel = () => {
  return (
    <aside className="space-y-8">
      {/* Trust items */}
      <div className="space-y-6">
        <h3 className="font-headline text-xl font-bold italic text-primary">Why Trust Us</h3>
        {trustItems.map((item, i) => (
          <div key={i} className="flex gap-3">
            <div className="text-primary mt-0.5 flex-shrink-0">{item.icon}</div>
            <div>
              <h4 className="font-body font-bold text-sm text-foreground">{item.title}</h4>
              <p className="font-body text-xs text-muted-foreground leading-relaxed mt-1">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Process steps */}
      <div className="bg-surface-low rounded-2xl p-6">
        <h3 className="font-headline text-lg font-bold italic text-foreground mb-4">How It Works</h3>
        <div className="space-y-4">
          {processSteps.map((s) => (
            <div key={s.step} className="flex items-start gap-3">
              <span className="font-headline text-2xl font-bold text-primary/30 leading-none">{s.step}</span>
              <p className="font-body text-sm text-muted-foreground pt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Eligibility */}
      <div className="bg-accent/40 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <HelpCircle className="h-4 w-4 text-primary" />
          <h3 className="font-headline text-lg font-bold italic text-foreground">Am I Eligible?</h3>
        </div>
        <ul className="space-y-2">
          {eligibilityRules.map((rule, i) => (
            <li key={i} className="flex items-start gap-2 text-sm font-body text-muted-foreground">
              <Clock className="h-3 w-3 text-primary mt-1 flex-shrink-0" />
              {rule}
            </li>
          ))}
        </ul>
      </div>

      {/* Quote */}
      <div className="border-l-4 border-primary pl-5">
        <p className="font-headline italic text-lg text-primary/70 leading-relaxed">
          "The blood you donate gives someone another chance at life. One day that someone may be a close relative, a friend, a loved one—or even you."
        </p>
        <span className="font-body text-xs text-muted-foreground mt-2 block">— Anonymous</span>
      </div>

      {/* Trust badges */}
      <div className="flex flex-wrap gap-3">
        {["Student Verified", "HIPAA Aligned", "Encrypted"].map((badge) => (
          <span
            key={badge}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-card rounded-full text-[10px] font-body font-bold uppercase tracking-widest text-muted-foreground shadow-ambient"
          >
            <Heart className="h-3 w-3 text-primary" />
            {badge}
          </span>
        ))}
      </div>
    </aside>
  );
};

export default TrustPanel;
