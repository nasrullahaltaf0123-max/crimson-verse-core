import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BloodGroupPill, bloodGroups, type BloodGroup } from "@/components/BloodGroupPill";
import { CrimsonButton } from "@/components/CrimsonButton";
import { ChevronDown, Shield, Users, Check, Upload } from "lucide-react";
import { useSiteStats } from "@/hooks/useSiteStats";

export interface QuickDonorData {
  fullName: string;
  phone: string;
  bloodGroup: BloodGroup | "";
  batch: string;
  gender: string;
  currentlyAvailable: boolean;
  accessToken?: string;
  // Advanced (collapsible)
  studentId: string;
  email: string;
  facebookLink: string;
  yearSemester: string;
  lastDonationDate: string;
  donorStatus: string;
  weight: string;
  healthIssues: string;
  preferredTime: string;
  currentArea: string;
  hallHostel: string;
  city: string;
  emergencyZone: string;
  bloodReport: File | null;
  studentIdCard: File | null;
  consentChecked: boolean;
}

const initialData: QuickDonorData = {
  fullName: "", phone: "", bloodGroup: "", batch: "", gender: "", currentlyAvailable: true,
  studentId: "", email: "", facebookLink: "", yearSemester: "", lastDonationDate: "",
  donorStatus: "", weight: "", healthIssues: "", preferredTime: "",
  currentArea: "", hallHostel: "", city: "", emergencyZone: "",
  bloodReport: null, studentIdCard: null, consentChecked: false,
};

const DRAFT_KEY = "crimson_verse_quick_draft";

interface QuickDonorFormProps {
  onSuccess: (data: QuickDonorData) => void;
}

const QuickDonorForm = ({ onSuccess }: QuickDonorFormProps) => {
  const [form, setForm] = useState<QuickDonorData>(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) return { ...initialData, ...JSON.parse(saved), bloodReport: null, studentIdCard: null };
    } catch { /* ignore */ }
    return initialData;
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { stats } = useSiteStats();

  // Autosave
  useEffect(() => {
    const t = setTimeout(() => {
      const { bloodReport, studentIdCard, ...saveable } = form;
      localStorage.setItem(DRAFT_KEY, JSON.stringify(saveable));
    }, 600);
    return () => clearTimeout(t);
  }, [form]);

  const update = useCallback(<K extends keyof QuickDonorData>(key: K, val: QuickDonorData[K]) => {
    setForm((p) => ({ ...p, [key]: val }));
    setErrors((p) => { const n = { ...p }; delete n[key]; return n; });
  }, []);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.fullName.trim()) e.fullName = "Required";
    if (!form.phone.trim() || !/^\+?\d{10,15}$/.test(form.phone.replace(/\s/g, ""))) e.phone = "Valid phone required";
    if (!form.bloodGroup) e.bloodGroup = "Pick your blood group";
    if (!form.batch) e.batch = "Select batch";
    if (!form.gender) e.gender = "Select gender";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);

    const { data, error } = await supabase.from("donors").insert({
      full_name: form.fullName.trim(),
      phone: form.phone.trim(),
      blood_group: form.bloodGroup,
      batch_session: form.batch,
      gender: form.gender,
      available_now: form.currentlyAvailable,
      student_roll: form.studentId.trim() || null,
      email: form.email.trim() || null,
      facebook_link: form.facebookLink.trim() || null,
      year_semester: form.yearSemester || null,
      last_donation_date: form.lastDonationDate.trim() || null,
      donor_status: form.donorStatus || null,
      weight: form.weight || null,
      health_notes: form.healthIssues.trim() || null,
      preferred_time: form.preferredTime || null,
      current_area: form.currentArea.trim() || null,
      hall_hostel: form.hallHostel.trim() || null,
      city: form.city.trim() || null,
      emergency_zone: form.emergencyZone || null,
      consent: form.consentChecked,
    }).select("access_token").single();

    setSubmitting(false);
    if (!error && data) {
      localStorage.removeItem(DRAFT_KEY);
      onSuccess({ ...form, accessToken: (data as any).access_token });
    }
  };

  const InputField = ({ label, field, placeholder, type = "text", required = false }: {
    label: string; field: keyof QuickDonorData; placeholder: string; type?: string; required?: boolean;
  }) => (
    <div>
      <label className="block font-body text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
        {label} {required && <span className="text-primary">*</span>}
      </label>
      <input
        type={type}
        value={form[field] as string}
        onChange={(e) => update(field, e.target.value)}
        placeholder={placeholder}
        className={`w-full bg-background rounded-xl px-4 py-3.5 font-body text-base text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring shadow-ambient transition-all ${
          errors[field] ? "ring-2 ring-destructive" : ""
        }`}
      />
      {errors[field] && <p className="text-destructive text-xs font-body mt-1">{errors[field]}</p>}
    </div>
  );

  const SelectField = ({ label, field, options, required = false }: {
    label: string; field: keyof QuickDonorData; options: string[]; required?: boolean;
  }) => (
    <div>
      <label className="block font-body text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
        {label} {required && <span className="text-primary">*</span>}
      </label>
      <select
        value={form[field] as string}
        onChange={(e) => update(field, e.target.value)}
        className={`w-full bg-background rounded-xl px-4 py-3.5 font-body text-base text-foreground focus:outline-none focus:ring-2 focus:ring-ring shadow-ambient ${
          errors[field] ? "ring-2 ring-destructive" : ""
        }`}
      >
        <option value="">Select...</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      {errors[field] && <p className="text-destructive text-xs font-body mt-1">{errors[field]}</p>}
    </div>
  );

  return (
    <div>
      {/* Social proof header */}
      <div className="flex items-center gap-3 bg-accent/40 rounded-xl p-4 mb-8">
        <Users className="h-5 w-5 text-primary flex-shrink-0" />
        <p className="font-body text-sm text-foreground">
          <span className="font-bold">{stats.total_donors} students</span> from English Dept already joined
        </p>
      </div>

      {/* Essential fields */}
      <div className="space-y-5">
        <h3 className="font-headline text-xl font-bold italic text-foreground">Quick Info <span className="text-muted-foreground font-body text-xs font-normal not-italic ml-2">~30 seconds</span></h3>

        <InputField label="Your Name" field="fullName" placeholder="Full name" required />

        <div className="grid grid-cols-2 gap-4">
          <InputField label="Phone" field="phone" placeholder="+880 1XXX..." type="tel" required />
          <SelectField label="Gender" field="gender" options={["Male", "Female", "Other"]} required />
        </div>

        <SelectField label="Batch / Session" field="batch" options={["2017-18", "2018-19", "2019-20", "2020-21", "2021-22", "2022-23", "2023-24", "2024-25", "2025-26", "2026-27", "2027-28", "2028-29", "2029-30", "Alumni"]} required />

        {/* Blood group - prominent */}
        <div>
          <label className="block font-body text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
            Blood Group <span className="text-primary">*</span>
          </label>
          <div className="grid grid-cols-4 gap-2.5">
            {bloodGroups.map((g) => (
              <BloodGroupPill
                key={g}
                group={g}
                active={form.bloodGroup === g}
                onClick={() => update("bloodGroup", form.bloodGroup === g ? "" : g)}
                className="rounded-xl py-3.5 text-base"
              />
            ))}
          </div>
          {errors.bloodGroup && <p className="text-destructive text-xs font-body mt-2">{errors.bloodGroup}</p>}
        </div>

        {/* Availability toggle */}
        <div className="flex items-center justify-between bg-background rounded-xl px-4 py-4 shadow-ambient">
          <div>
            <span className="font-body text-sm font-bold text-foreground block">Available to donate now</span>
            <span className="font-body text-xs text-muted-foreground">You can change this anytime</span>
          </div>
          <button
            onClick={() => update("currentlyAvailable", !form.currentlyAvailable)}
            className={`relative w-12 h-7 rounded-full transition-colors ${form.currentlyAvailable ? "bg-primary" : "bg-muted"}`}
          >
            <div className={`absolute top-1 w-5 h-5 rounded-full bg-card shadow-ambient transition-transform ${form.currentlyAvailable ? "translate-x-6" : "translate-x-1"}`} />
          </button>
        </div>
      </div>

      {/* Advanced fields (collapsible) */}
      <div className="mt-8">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 font-body text-sm font-medium text-muted-foreground hover:text-foreground transition-colors w-full"
        >
          <ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
          {showAdvanced ? "Hide" : "Add more"} details (optional)
        </button>

        {showAdvanced && (
          <div className="mt-5 space-y-5 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField label="Student ID / Roll" field="studentId" placeholder="e.g. ENG-2024-042" />
              <InputField label="Email" field="email" placeholder="your@email.com" type="email" />
            </div>
            <InputField label="Facebook Profile" field="facebookLink" placeholder="https://facebook.com/you" />
            <SelectField label="Year / Semester" field="yearSemester" options={["1st Year", "2nd Year", "3rd Year", "4th Year", "Alumni"]} />

            <h4 className="font-headline text-lg font-bold italic text-foreground pt-2">Medical</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField label="Last Donation" field="lastDonationDate" placeholder="e.g. March 2024 or Never" />
              <InputField label="Weight (kg)" field="weight" placeholder="e.g. 65" type="number" />
            </div>
            <SelectField label="Donor Status" field="donorStatus" options={["First-time Donor", "Regular Donor", "Occasional Donor"]} />
            <InputField label="Health Issues" field="healthIssues" placeholder="Any conditions or 'None'" />
            <SelectField label="Preferred Time" field="preferredTime" options={["Morning", "Afternoon", "Evening", "Anytime"]} />

            <h4 className="font-headline text-lg font-bold italic text-foreground pt-2">Location</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField label="Current Area" field="currentArea" placeholder="e.g. College Road" />
              <InputField label="Hall / Hostel" field="hallHostel" placeholder="e.g. Fazlul Haq Hall" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField label="City" field="city" placeholder="e.g. Barisal" />
              <SelectField label="Emergency Reach" field="emergencyZone" options={["Within Campus", "Within City", "Nearby Districts", "Anywhere"]} />
            </div>

            <h4 className="font-headline text-lg font-bold italic text-foreground pt-2">Verification</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-body text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Blood Report</label>
                <label className="flex items-center gap-3 px-4 py-4 bg-background rounded-xl shadow-ambient cursor-pointer hover:shadow-elevated transition-shadow">
                  {form.bloodReport ? (
                    <><Check className="h-5 w-5 text-primary" /><span className="font-body text-sm truncate">{form.bloodReport.name}</span></>
                  ) : (
                    <><Upload className="h-5 w-5 text-muted-foreground" /><span className="font-body text-sm text-muted-foreground">Upload (optional)</span></>
                  )}
                  <input type="file" className="hidden" accept="image/*,.pdf" onChange={(e) => update("bloodReport", e.target.files?.[0] || null)} />
                </label>
              </div>
              <div>
                <label className="block font-body text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Student ID</label>
                <label className="flex items-center gap-3 px-4 py-4 bg-background rounded-xl shadow-ambient cursor-pointer hover:shadow-elevated transition-shadow">
                  {form.studentIdCard ? (
                    <><Check className="h-5 w-5 text-primary" /><span className="font-body text-sm truncate">{form.studentIdCard.name}</span></>
                  ) : (
                    <><Upload className="h-5 w-5 text-muted-foreground" /><span className="font-body text-sm text-muted-foreground">Upload (optional)</span></>
                  )}
                  <input type="file" className="hidden" accept="image/*,.pdf" onChange={(e) => update("studentIdCard", e.target.files?.[0] || null)} />
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Consent + Submit */}
      <div className="mt-8 space-y-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <div
            onClick={() => update("consentChecked", !form.consentChecked)}
            className={`w-5 h-5 rounded flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
              form.consentChecked ? "bg-primary" : "bg-background shadow-ambient"
            }`}
          >
            {form.consentChecked && <Check className="h-3 w-3 text-primary-foreground" />}
          </div>
          <span className="font-body text-xs text-muted-foreground leading-relaxed" onClick={() => update("consentChecked", !form.consentChecked)}>
            I agree to share my blood info with the BM College English Department community for emergency donor matching.
          </span>
        </label>

        {/* Desktop submit */}
        <div className="hidden lg:block">
          <CrimsonButton
            variant="primary"
            size="lg"
            className="w-full"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? "Joining..." : "✓ Join as Donor — It's Free"}
          </CrimsonButton>
        </div>

        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Shield className="h-3.5 w-3.5" />
          <span className="font-body text-xs">Student-only community • Your info stays private</span>
        </div>
      </div>

      {/* Mobile sticky submit */}
      <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-background/95 backdrop-blur-xl border-t border-border/30 px-4 py-3 z-40">
        <CrimsonButton
          variant="primary"
          className="w-full"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? "Joining..." : "✓ Join as Donor"}
        </CrimsonButton>
      </div>
    </div>
  );
};

export default QuickDonorForm;
