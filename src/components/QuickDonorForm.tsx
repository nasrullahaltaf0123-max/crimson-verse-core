import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BloodGroupPill, bloodGroups, type BloodGroup } from "@/components/BloodGroupPill";
import { CrimsonButton } from "@/components/CrimsonButton";
import { ChevronDown, Shield, Users, Check, Upload } from "lucide-react";
import { toast } from "sonner";
import { useSiteStats } from "@/hooks/useSiteStats";
import { FormInput, FormSelect } from "@/components/FormFields";

export interface QuickDonorData {
  fullName: string;
  phone: string;
  bloodGroup: BloodGroup | "";
  batch: string;
  gender: string;
  currentlyAvailable: boolean;
  accessToken?: string;
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
  const submittingRef = useRef(false);
  const { stats } = useSiteStats();

  // Debounced autosave
  useEffect(() => {
    const t = setTimeout(() => {
      const { bloodReport, studentIdCard, ...saveable } = form;
      localStorage.setItem(DRAFT_KEY, JSON.stringify(saveable));
    }, 1200);
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
    if (submittingRef.current) return;
    if (!validate()) return;
    setSubmitting(true);
    submittingRef.current = true;

    try {
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

      console.log("[CrimsonVerse] Donor insert:", { data, error });

      if (error) {
        console.error("[CrimsonVerse] Donor insert error:", error.message);
        toast.error("Failed to save. Please try again.", { description: error.message });
        return;
      }

      localStorage.removeItem(DRAFT_KEY);
      toast.success("Welcome to the circle! 🩸");
      onSuccess({ ...form, accessToken: (data as any).access_token });
    } catch (err: any) {
      console.error("[CrimsonVerse] Donor insert exception:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
      submittingRef.current = false;
    }
  };

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

        <FormInput label="Your Name" value={form.fullName} onChange={(v) => update("fullName", v)} placeholder="Full name" required error={errors.fullName} />

        <div className="grid grid-cols-2 gap-4">
          <FormInput label="Phone" value={form.phone} onChange={(v) => update("phone", v)} placeholder="+880 1XXX..." type="tel" required error={errors.phone} />
          <FormSelect label="Gender" value={form.gender} onChange={(v) => update("gender", v)} options={["Male", "Female", "Other"]} required error={errors.gender} />
        </div>

        <FormSelect label="Batch / Session" value={form.batch} onChange={(v) => update("batch", v)} options={["2017-18", "2018-19", "2019-20", "2020-21", "2021-22", "2022-23", "2023-24", "2024-25", "2025-26", "2026-27", "2027-28", "2028-29", "2029-30", "Alumni"]} required error={errors.batch} />

        {/* Blood group */}
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
            type="button"
            onClick={() => update("currentlyAvailable", !form.currentlyAvailable)}
            className={`relative w-12 h-7 rounded-full transition-colors ${form.currentlyAvailable ? "bg-primary" : "bg-muted"}`}
          >
            <div className={`absolute top-1 w-5 h-5 rounded-full bg-card shadow-ambient transition-transform ${form.currentlyAvailable ? "translate-x-6" : "translate-x-1"}`} />
          </button>
        </div>
      </div>

      {/* Advanced fields */}
      <div className="mt-8">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 font-body text-sm font-medium text-muted-foreground hover:text-foreground transition-colors w-full"
        >
          <ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
          {showAdvanced ? "Hide" : "Add more"} details (optional)
        </button>

        {showAdvanced && (
          <div className="mt-5 space-y-5 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput label="Student ID / Roll" value={form.studentId} onChange={(v) => update("studentId", v)} placeholder="e.g. ENG-2024-042" />
              <FormInput label="Email" value={form.email} onChange={(v) => update("email", v)} placeholder="your@email.com" type="email" />
            </div>
            <FormInput label="Facebook Profile" value={form.facebookLink} onChange={(v) => update("facebookLink", v)} placeholder="https://facebook.com/you" />
            <FormSelect label="Year / Semester" value={form.yearSemester} onChange={(v) => update("yearSemester", v)} options={["1st Year", "2nd Year", "3rd Year", "4th Year", "Alumni"]} />

            <h4 className="font-headline text-lg font-bold italic text-foreground pt-2">Medical</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput label="Last Donation" value={form.lastDonationDate} onChange={(v) => update("lastDonationDate", v)} placeholder="e.g. March 2024 or Never" />
              <FormInput label="Weight (kg)" value={form.weight} onChange={(v) => update("weight", v)} placeholder="e.g. 65" type="number" />
            </div>
            <FormSelect label="Donor Status" value={form.donorStatus} onChange={(v) => update("donorStatus", v)} options={["First-time Donor", "Regular Donor", "Occasional Donor"]} />
            <FormInput label="Health Issues" value={form.healthIssues} onChange={(v) => update("healthIssues", v)} placeholder="Any conditions or 'None'" />
            <FormSelect label="Preferred Time" value={form.preferredTime} onChange={(v) => update("preferredTime", v)} options={["Morning", "Afternoon", "Evening", "Anytime"]} />

            <h4 className="font-headline text-lg font-bold italic text-foreground pt-2">Location</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput label="Current Area" value={form.currentArea} onChange={(v) => update("currentArea", v)} placeholder="e.g. College Road" />
              <FormInput label="Hall / Hostel" value={form.hallHostel} onChange={(v) => update("hallHostel", v)} placeholder="e.g. Fazlul Haq Hall" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput label="City" value={form.city} onChange={(v) => update("city", v)} placeholder="e.g. Barisal" />
              <FormSelect label="Emergency Reach" value={form.emergencyZone} onChange={(v) => update("emergencyZone", v)} options={["Within Campus", "Within City", "Nearby Districts", "Anywhere"]} />
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

      {/* Mobile sticky submit - tabIndex -1 prevents focus stealing */}
      <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-background/95 backdrop-blur-xl border-t border-border/30 px-4 py-3 z-40">
        <CrimsonButton
          variant="primary"
          className="w-full"
          onClick={handleSubmit}
          disabled={submitting}
          tabIndex={-1}
        >
          {submitting ? "Joining..." : "✓ Join as Donor"}
        </CrimsonButton>
      </div>
    </div>
  );
};

export default QuickDonorForm;
