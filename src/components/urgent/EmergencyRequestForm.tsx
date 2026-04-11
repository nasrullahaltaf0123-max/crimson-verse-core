import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BloodGroupPill, bloodGroups } from "@/components/BloodGroupPill";
import { CrimsonButton } from "@/components/CrimsonButton";
import { ChevronDown, AlertTriangle } from "lucide-react";

interface Props {
  onSuccess: (patientName: string, bloodGroup: string, area?: string) => void;
  onCancel: () => void;
}

interface FormData {
  patient_name: string;
  blood_group: string;
  units_needed: string;
  hospital: string;
  contact_number: string;
  deadline: string;
  urgency_level: string;
  current_area: string;
  notes: string;
  doctor_note: string;
  ward_cabin: string;
  replacement_needed: boolean;
  donor_preference: string;
  gender_preference: string;
  additional_instructions: string;
}

const initialForm: FormData = {
  patient_name: "", blood_group: "", units_needed: "1", hospital: "",
  contact_number: "", deadline: "", urgency_level: "urgent", current_area: "",
  notes: "", doctor_note: "", ward_cabin: "", replacement_needed: false,
  donor_preference: "", gender_preference: "", additional_instructions: "",
};

const EmergencyRequestForm = ({ onSuccess, onCancel }: Props) => {
  const [form, setForm] = useState<FormData>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const update = useCallback(<K extends keyof FormData>(key: K, val: FormData[K]) => {
    setForm((p) => ({ ...p, [key]: val }));
    setErrors((p) => { const n = { ...p }; delete n[key]; return n; });
  }, []);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.patient_name.trim()) e.patient_name = "Required";
    if (!form.blood_group) e.blood_group = "Select blood group";
    if (!form.hospital.trim()) e.hospital = "Required";
    if (!form.contact_number.trim() || !/^\+?\d{10,15}$/.test(form.contact_number.replace(/\s/g, "")))
      e.contact_number = "Valid phone required";
    if (!form.urgency_level) e.urgency_level = "Select urgency";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);

    const { error } = await supabase.from("emergency_requests").insert({
      patient_name: form.patient_name.trim(),
      blood_group: form.blood_group,
      units_needed: parseInt(form.units_needed) || 1,
      hospital: form.hospital.trim(),
      contact_number: form.contact_number.trim(),
      deadline: form.deadline || null,
      urgency_level: form.urgency_level as any,
      current_area: form.current_area.trim() || null,
      notes: form.notes.trim() || null,
      doctor_note: form.doctor_note.trim() || null,
      ward_cabin: form.ward_cabin.trim() || null,
      replacement_needed: form.replacement_needed,
      donor_preference: form.donor_preference.trim() || null,
      gender_preference: form.gender_preference || null,
      additional_instructions: form.additional_instructions.trim() || null,
    });

    setSubmitting(false);
    if (!error) {
      onSuccess(form.patient_name, form.blood_group, form.current_area || undefined);
    }
  };

  const InputField = ({ label, field, placeholder, type = "text", required = false }: {
    label: string; field: keyof FormData; placeholder: string; type?: string; required?: boolean;
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
        className={`w-full bg-background rounded-xl px-4 py-3.5 font-body text-base text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring shadow-ambient transition-all ${errors[field] ? "ring-2 ring-destructive" : ""}`}
      />
      {errors[field] && <p className="text-destructive text-xs font-body mt-1">{errors[field]}</p>}
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
          <AlertTriangle className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h3 className="font-headline text-xl font-bold italic text-foreground">Emergency Request</h3>
          <p className="font-body text-xs text-muted-foreground">Fill essentials only — takes under 20 seconds</p>
        </div>
      </div>

      <div className="space-y-5">
        <InputField label="Patient Name" field="patient_name" placeholder="Who needs blood?" required />

        {/* Blood group */}
        <div>
          <label className="block font-body text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
            Blood Group Needed <span className="text-primary">*</span>
          </label>
          <div className="grid grid-cols-4 gap-2.5">
            {bloodGroups.map((g) => (
              <BloodGroupPill
                key={g}
                group={g}
                active={form.blood_group === g}
                onClick={() => update("blood_group", form.blood_group === g ? "" : g)}
                className="rounded-xl py-3.5 text-base"
              />
            ))}
          </div>
          {errors.blood_group && <p className="text-destructive text-xs font-body mt-2">{errors.blood_group}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-body text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
              Units Needed
            </label>
            <select
              value={form.units_needed}
              onChange={(e) => update("units_needed", e.target.value)}
              className="w-full bg-background rounded-xl px-4 py-3.5 font-body text-base text-foreground focus:outline-none focus:ring-2 focus:ring-ring shadow-ambient"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <option key={n} value={n}>{n} {n === 1 ? "Unit" : "Units"}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-body text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
              Urgency <span className="text-primary">*</span>
            </label>
            <div className="flex gap-2">
              {(["critical", "urgent", "moderate"] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => update("urgency_level", level)}
                  className={`flex-1 px-2 py-3 text-xs font-body font-bold uppercase tracking-wider rounded-xl transition-all active:scale-95 ${
                    form.urgency_level === level
                      ? level === "critical"
                        ? "bg-primary text-primary-foreground"
                        : level === "urgent"
                          ? "bg-primary/80 text-primary-foreground"
                          : "bg-accent text-accent-foreground"
                      : "bg-background text-muted-foreground shadow-ambient"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
            {errors.urgency_level && <p className="text-destructive text-xs font-body mt-1">{errors.urgency_level}</p>}
          </div>
        </div>

        <InputField label="Hospital / Clinic" field="hospital" placeholder="e.g. Sher-e-Bangla Medical" required />

        <div className="grid grid-cols-2 gap-4">
          <InputField label="Contact Number" field="contact_number" placeholder="+880 1XXX..." type="tel" required />
          <InputField label="Deadline" field="deadline" placeholder="" type="datetime-local" />
        </div>

        <InputField label="Current Area" field="current_area" placeholder="e.g. Barisal City" />

        <div>
          <label className="block font-body text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => update("notes", e.target.value)}
            placeholder="Any critical details..."
            rows={2}
            className="w-full bg-background rounded-xl px-4 py-3.5 font-body text-base text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring shadow-ambient resize-none"
          />
        </div>
      </div>

      {/* Advanced (collapsible) */}
      <div className="mt-6">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 font-body text-sm font-medium text-muted-foreground hover:text-foreground transition-colors w-full"
        >
          <ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
          {showAdvanced ? "Hide" : "More"} details (optional)
        </button>

        {showAdvanced && (
          <div className="mt-5 space-y-5 animate-fade-in">
            <InputField label="Doctor Note" field="doctor_note" placeholder="Doctor's instructions" />
            <InputField label="Ward / Cabin" field="ward_cabin" placeholder="e.g. Ward 5, Cabin 3" />

            <div className="flex items-center justify-between bg-background rounded-xl px-4 py-4 shadow-ambient">
              <div>
                <span className="font-body text-sm font-bold text-foreground block">Replacement blood needed</span>
                <span className="font-body text-xs text-muted-foreground">Hospital requires blood replacement</span>
              </div>
              <button
                onClick={() => update("replacement_needed", !form.replacement_needed)}
                className={`relative w-12 h-7 rounded-full transition-colors ${form.replacement_needed ? "bg-primary" : "bg-muted"}`}
              >
                <div className={`absolute top-1 w-5 h-5 rounded-full bg-card shadow-ambient transition-transform ${form.replacement_needed ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-body text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Donor Preference</label>
                <select
                  value={form.donor_preference}
                  onChange={(e) => update("donor_preference", e.target.value)}
                  className="w-full bg-background rounded-xl px-4 py-3.5 font-body text-base text-foreground focus:outline-none focus:ring-2 focus:ring-ring shadow-ambient"
                >
                  <option value="">Any</option>
                  <option value="student">Students Only</option>
                  <option value="regular">Regular Donors</option>
                </select>
              </div>
              <div>
                <label className="block font-body text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Gender Preference</label>
                <select
                  value={form.gender_preference}
                  onChange={(e) => update("gender_preference", e.target.value)}
                  className="w-full bg-background rounded-xl px-4 py-3.5 font-body text-base text-foreground focus:outline-none focus:ring-2 focus:ring-ring shadow-ambient"
                >
                  <option value="">Any</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-body text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Additional Instructions</label>
              <textarea
                value={form.additional_instructions}
                onChange={(e) => update("additional_instructions", e.target.value)}
                placeholder="Any other instructions for donors..."
                rows={2}
                className="w-full bg-background rounded-xl px-4 py-3.5 font-body text-base text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring shadow-ambient resize-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-8 flex flex-col gap-3">
        <CrimsonButton variant="primary" size="lg" className="w-full" onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Posting..." : "🚨 Post Emergency Request"}
        </CrimsonButton>
        <button onClick={onCancel} className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default EmergencyRequestForm;
