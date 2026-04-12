import { memo } from "react";

interface InputFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  required?: boolean;
  error?: string;
  inputMode?: "text" | "numeric" | "tel" | "email" | "url" | "search" | "decimal" | "none";
  maxLength?: number;
  autoComplete?: string;
  autoCorrect?: "on" | "off";
}

export const FormInput = memo(({ label, value, onChange, placeholder, type = "text", required = false, error, inputMode, maxLength, autoComplete, autoCorrect }: InputFieldProps) => (
  <div>
    <label className="block font-body text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
      {label} {required && <span className="text-primary">*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      inputMode={inputMode}
      maxLength={maxLength}
      autoComplete={autoComplete}
      autoCorrect={autoCorrect}
      className={`w-full bg-background rounded-xl px-4 py-3.5 font-body text-base text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring shadow-ambient transition-all ${error ? "ring-2 ring-destructive" : ""}`}
    />
    {error && <p className="text-destructive text-xs font-body mt-1">{error}</p>}
  </div>
));
FormInput.displayName = "FormInput";

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  required?: boolean;
  error?: string;
}

export const FormSelect = memo(({ label, value, onChange, options, required = false, error }: SelectFieldProps) => (
  <div>
    <label className="block font-body text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
      {label} {required && <span className="text-primary">*</span>}
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full bg-background rounded-xl px-4 py-3.5 font-body text-base text-foreground focus:outline-none focus:ring-2 focus:ring-ring shadow-ambient ${error ? "ring-2 ring-destructive" : ""}`}
    >
      <option value="">Select...</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
    {error && <p className="text-destructive text-xs font-body mt-1">{error}</p>}
  </div>
));
FormSelect.displayName = "FormSelect";

interface TextareaFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  rows?: number;
}

export const FormTextarea = memo(({ label, value, onChange, placeholder, rows = 2 }: TextareaFieldProps) => (
  <div>
    <label className="block font-body text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">{label}</label>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full bg-background rounded-xl px-4 py-3.5 font-body text-base text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring shadow-ambient resize-none"
    />
  </div>
));
FormTextarea.displayName = "FormTextarea";
