import { useState, useCallback, useEffect, useRef } from "react";
import { BloodGroupPill, bloodGroups, type BloodGroup } from "@/components/BloodGroupPill";
import { CrimsonButton } from "@/components/CrimsonButton";
import { Upload, Check } from "lucide-react";

export interface DonorFormData {
  // Personal
  fullName: string;
  studentId: string;
  batch: string;
  yearSemester: string;
  gender: string;
  phone: string;
  email: string;
  facebookLink: string;
  // Medical
  bloodGroup: BloodGroup | "";
  lastDonationDate: string;
  donorStatus: string;
  weight: string;
  healthIssues: string;
  currentlyAvailable: boolean;
  preferredTime: string;
  // Location
  currentArea: string;
  hallHostel: string;
  city: string;
  emergencyZone: string;
  // Verification
  bloodReport: File | null;
  studentIdCard: File | null;
  consentChecked: boolean;
  privacyChecked: boolean;
  emergencyContactPermission: boolean;
}

const initialFormData: DonorFormData = {
  fullName: "", studentId: "", batch: "", yearSemester: "", gender: "", phone: "", email: "", facebookLink: "",
  bloodGroup: "", lastDonationDate: "", donorStatus: "", weight: "", healthIssues: "", currentlyAvailable: false, preferredTime: "",
  currentArea: "", hallHostel: "", city: "", emergencyZone: "",
  bloodReport: null, studentIdCard: null, consentChecked: false, privacyChecked: false, emergencyContactPermission: false,
};

const DRAFT_KEY = "crimson_verse_draft";

const sections = ["Personal", "Medical", "Location", "Verification"] as const;
type Section = (typeof sections)[number];

interface DonorFormProps {
  onSuccess: () => void;
}

const DonorForm = ({ onSuccess }: DonorFormProps) => {
  const [form, setForm] = useState<DonorFormData>(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...initialFormData, ...parsed, bloodReport: null, studentIdCard: null };
      }
    } catch { /* ignore */ }
    return initialFormData;
  });

  const [activeSection, setActiveSection] = useState<Section>("Personal");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const fileInputBlood = useRef<HTMLInputElement>(null);
  const fileInputId = useRef<HTMLInputElement>(null);

  // Autosave draft
  useEffect(() => {
    const timeout = setTimeout(() => {
      const { bloodReport, studentIdCard, ...saveable } = form;
      localStorage.setItem(DRAFT_KEY, JSON.stringify(saveable));
    }, 800);
    return () => clearTimeout(timeout);
  }, [form]);

  const update = useCallback(<K extends keyof DonorFormData>(key: K, value: DonorFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setTouched((prev) => new Set(prev).add(key));
  }, []);

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.fullName.trim()) e.fullName = "Name is required";
    if (!form.studentId.trim()) e.studentId = "Student ID is required";
    if (!form.batch) e.batch = "Select a batch";
    if (!form.gender) e.gender = "Select gender";
    if (!form.phone.trim() || !/^\+?\d{10,15}$/.test(form.phone.replace(/\s/g, ""))) e.phone = "Valid phone required";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email";
    if (!form.bloodGroup) e.bloodGroup = "Select blood group";
    if (form.weight && (isNaN(Number(form.weight)) || Number(form.weight) < 30)) e.weight = "Enter valid weight (kg)";
    if (!form.consentChecked) e.consentChecked = "Consent is required";
    if (!form.privacyChecked) e.privacyChecked = "Privacy agreement is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      localStorage.removeItem(DRAFT_KEY);
      onSuccess();
    } else {
      // Jump to first section with error
      const errorKeys = Object.keys(errors);
      if (errorKeys.some(k => ["fullName","studentId","batch","yearSemester","gender","phone","email","facebookLink"].includes(k))) setActiveSection("Personal");
      else if (errorKeys.some(k => ["bloodGroup","weight"].includes(k))) setActiveSection("Medical");
      else setActiveSection("Verification");
    }
  };

  const saveDraft = () => {
    const { bloodReport, studentIdCard, ...saveable } = form;
    localStorage.setItem(DRAFT_KEY, JSON.stringify(saveable));
  };

  const sectionIndex = sections.indexOf(activeSection);
  const progress = ((sectionIndex + 1) / sections.length) * 100;

  const InputField = ({ label, field, placeholder, type = "text", required = false }: { label: string; field: keyof DonorFormData; placeholder: string; type?: string; required?: boolean }) => (
    <div>
      <label className="block font-body text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
        {label} {required && <span className="text-primary">*</span>}
      </label>
      <input
        type={type}
        value={form[field] as string}
        onChange={(e) => update(field, e.target.value)}
        placeholder={placeholder}
        className={`w-full bg-card rounded-lg px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring shadow-ambient transition-shadow focus:shadow-elevated ${
          errors[field] && touched.has(field) ? "ring-2 ring-destructive" : ""
        }`}
      />
      {errors[field] && touched.has(field) && (
        <p className="text-destructive text-xs font-body mt-1">{errors[field]}</p>
      )}
    </div>
  );

  const SelectField = ({ label, field, options, required = false }: { label: string; field: keyof DonorFormData; options: string[]; required?: boolean }) => (
    <div>
      <label className="block font-body text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
        {label} {required && <span className="text-primary">*</span>}
      </label>
      <select
        value={form[field] as string}
        onChange={(e) => update(field, e.target.value)}
        className={`w-full bg-card rounded-lg px-4 py-3 font-body text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring shadow-ambient ${
          errors[field] && touched.has(field) ? "ring-2 ring-destructive" : ""
        }`}
      >
        <option value="">Select...</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      {errors[field] && touched.has(field) && (
        <p className="text-destructive text-xs font-body mt-1">{errors[field]}</p>
      )}
    </div>
  );

  const FileUpload = ({ label, file, onFile }: { label: string; file: File | null; onFile: (f: File | null) => void }) => (
    <div>
      <label className="block font-body text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">{label}</label>
      <div
        onClick={() => {
          const input = document.createElement("input");
          input.type = "file";
          input.accept = "image/*,.pdf";
          input.onchange = (e) => {
            const f = (e.target as HTMLInputElement).files?.[0] || null;
            onFile(f);
          };
          input.click();
        }}
        className="flex items-center gap-3 px-4 py-4 bg-card rounded-lg shadow-ambient cursor-pointer hover:shadow-elevated transition-shadow"
      >
        {file ? (
          <>
            <Check className="h-5 w-5 text-primary" />
            <span className="font-body text-sm text-foreground truncate">{file.name}</span>
          </>
        ) : (
          <>
            <Upload className="h-5 w-5 text-muted-foreground" />
            <span className="font-body text-sm text-muted-foreground">Click to upload</span>
          </>
        )}
      </div>
    </div>
  );

  const CheckboxField = ({ label, field, desc }: { label: string; field: keyof DonorFormData; desc?: string }) => (
    <label className="flex items-start gap-3 cursor-pointer group">
      <div
        className={`w-5 h-5 rounded flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
          form[field] ? "bg-primary" : "bg-card shadow-ambient"
        }`}
        onClick={() => update(field, !form[field] as any)}
      >
        {form[field] && <Check className="h-3 w-3 text-primary-foreground" />}
      </div>
      <div onClick={() => update(field, !form[field] as any)}>
        <span className="font-body text-sm font-medium text-foreground">{label}</span>
        {desc && <p className="font-body text-xs text-muted-foreground mt-0.5">{desc}</p>}
        {errors[field] && <p className="text-destructive text-xs font-body mt-1">{errors[field]}</p>}
      </div>
    </label>
  );

  return (
    <div>
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          {sections.map((s, i) => (
            <button
              key={s}
              onClick={() => setActiveSection(s)}
              className={`font-body text-xs font-bold uppercase tracking-widest transition-colors ${
                s === activeSection ? "text-primary" : i <= sectionIndex ? "text-foreground" : "text-muted-foreground/50"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Personal Section */}
      {activeSection === "Personal" && (
        <div className="space-y-5 animate-fade-in">
          <h3 className="font-headline text-2xl font-bold italic text-foreground mb-2">Personal Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <InputField label="Full Name" field="fullName" placeholder="Your full name" required />
            <InputField label="Student ID / Roll" field="studentId" placeholder="e.g. ENG-2024-042" required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <SelectField label="Batch / Session" field="batch" options={["2017-18", "2018-19", "2019-20", "2020-21", "2021-22", "2022-23", "2023-24", "2024-25", "2025-26", "2026-27", "2027-28", "2028-29", "2029-30", "Alumni"]} required />
            <SelectField label="Year / Semester" field="yearSemester" options={["1st Year", "2nd Year", "3rd Year", "4th Year", "Alumni"]} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <SelectField label="Gender" field="gender" options={["Male", "Female", "Other"]} required />
            <InputField label="Phone" field="phone" placeholder="+880 1XXX-XXXXXX" type="tel" required />
          </div>
          <InputField label="Email" field="email" placeholder="your@email.com" type="email" />
          <InputField label="Facebook Profile Link" field="facebookLink" placeholder="https://facebook.com/yourprofile" />
        </div>
      )}

      {/* Medical Section */}
      {activeSection === "Medical" && (
        <div className="space-y-5 animate-fade-in">
          <h3 className="font-headline text-2xl font-bold italic text-foreground mb-2">Medical Information</h3>

          <div>
            <label className="block font-body text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
              Blood Group <span className="text-primary">*</span>
            </label>
            <div className="grid grid-cols-4 gap-3">
              {bloodGroups.map((g) => (
                <BloodGroupPill
                  key={g}
                  group={g}
                  active={form.bloodGroup === g}
                  onClick={() => update("bloodGroup", form.bloodGroup === g ? "" : g)}
                  className="rounded-lg py-3"
                />
              ))}
            </div>
            {errors.bloodGroup && <p className="text-destructive text-xs font-body mt-2">{errors.bloodGroup}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <InputField label="Last Donation Date" field="lastDonationDate" placeholder="e.g. March 2024 or Never" />
            <SelectField label="Donor Status" field="donorStatus" options={["First-time Donor", "Regular Donor", "Occasional Donor"]} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <InputField label="Weight (kg)" field="weight" placeholder="e.g. 65" type="number" />
            <SelectField label="Preferred Donation Time" field="preferredTime" options={["Morning", "Afternoon", "Evening", "Anytime"]} />
          </div>
          <InputField label="Known Health Issues" field="healthIssues" placeholder="List any conditions or write 'None'" />

          <div className="flex items-center justify-between bg-card rounded-lg px-4 py-4 shadow-ambient">
            <div>
              <span className="font-body text-sm font-bold text-foreground block">Currently Available</span>
              <span className="font-body text-xs text-muted-foreground">Toggle on if ready to donate now</span>
            </div>
            <button
              onClick={() => update("currentlyAvailable", !form.currentlyAvailable)}
              className={`relative w-12 h-7 rounded-full transition-colors ${form.currentlyAvailable ? "bg-primary" : "bg-muted"}`}
            >
              <div className={`absolute top-1 w-5 h-5 rounded-full bg-card shadow-ambient transition-transform ${form.currentlyAvailable ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>
        </div>
      )}

      {/* Location Section */}
      {activeSection === "Location" && (
        <div className="space-y-5 animate-fade-in">
          <h3 className="font-headline text-2xl font-bold italic text-foreground mb-2">Location & Reach</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <InputField label="Current Area" field="currentArea" placeholder="e.g. College Road, Barisal" />
            <InputField label="Hall / Hostel" field="hallHostel" placeholder="e.g. Fazlul Haq Hall" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <InputField label="City" field="city" placeholder="e.g. Barisal" />
            <SelectField label="Emergency Reach Zone" field="emergencyZone" options={["Within Campus", "Within City", "Nearby Districts", "Anywhere"]} />
          </div>
        </div>
      )}

      {/* Verification Section */}
      {activeSection === "Verification" && (
        <div className="space-y-5 animate-fade-in">
          <h3 className="font-headline text-2xl font-bold italic text-foreground mb-2">Verification & Consent</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FileUpload label="Blood Report" file={form.bloodReport} onFile={(f) => update("bloodReport", f)} />
            <FileUpload label="Student ID Card" file={form.studentIdCard} onFile={(f) => update("studentIdCard", f)} />
          </div>

          <div className="space-y-4 mt-4">
            <CheckboxField
              label="I consent to share my medical information"
              field="consentChecked"
              desc="Your data will only be used for blood donation matching within the BM College community."
            />
            <CheckboxField
              label="I agree to the privacy policy"
              field="privacyChecked"
              desc="Your information is encrypted and never sold to third parties."
            />
            <CheckboxField
              label="Allow emergency contact"
              field="emergencyContactPermission"
              desc="Verified requesters can contact you directly during life-threatening emergencies."
            />
          </div>
        </div>
      )}

      {/* Navigation + Submit */}
      <div className="mt-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {sectionIndex > 0 && (
          <CrimsonButton variant="ghost" onClick={() => setActiveSection(sections[sectionIndex - 1])}>
            ← Back
          </CrimsonButton>
        )}
        <div className="flex-grow" />
        {sectionIndex < sections.length - 1 ? (
          <CrimsonButton variant="primary" onClick={() => setActiveSection(sections[sectionIndex + 1])}>
            Continue →
          </CrimsonButton>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <CrimsonButton variant="outline" onClick={saveDraft} className="sm:w-auto w-full">
              Save Draft
            </CrimsonButton>
            <CrimsonButton variant="primary" onClick={handleSubmit} className="sm:w-auto w-full">
              Join as Verified Donor
            </CrimsonButton>
          </div>
        )}
      </div>
    </div>
  );
};

export default DonorForm;
