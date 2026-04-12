import { supabase } from "@/integrations/supabase/client";

const SPAM_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes
const MAX_REQUESTS_PER_PHONE_PER_DAY = 3;
const LOCAL_KEY = "cv_last_emergency_post";

interface SpamCheckResult {
  allowed: boolean;
  reason?: string;
}

/** Client-side rate limit via localStorage */
function checkLocalCooldown(): SpamCheckResult {
  const last = localStorage.getItem(LOCAL_KEY);
  if (last) {
    const elapsed = Date.now() - parseInt(last, 10);
    if (elapsed < SPAM_COOLDOWN_MS) {
      const mins = Math.ceil((SPAM_COOLDOWN_MS - elapsed) / 60000);
      return { allowed: false, reason: `Please wait ${mins} minute${mins > 1 ? "s" : ""} before posting another request.` };
    }
  }
  return { allowed: true };
}

/** Check for duplicate phone + blood group in last 24h */
async function checkDuplicateRequest(phone: string, bloodGroup: string): Promise<SpamCheckResult> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from("emergency_requests")
    .select("id")
    .eq("contact_number", phone)
    .eq("blood_group", bloodGroup)
    .gte("created_at", since)
    .eq("status", "active");

  if (!error && data && data.length > 0) {
    return { allowed: false, reason: "An active request with this phone and blood group already exists." };
  }
  return { allowed: true };
}

/** Check daily limit per phone */
async function checkDailyLimit(phone: string): Promise<SpamCheckResult> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from("emergency_requests")
    .select("id")
    .eq("contact_number", phone)
    .gte("created_at", since);

  if (!error && data && data.length >= MAX_REQUESTS_PER_PHONE_PER_DAY) {
    return { allowed: false, reason: "Daily request limit reached for this phone number. Try again tomorrow." };
  }
  return { allowed: true };
}

/** Validate input quality */
function checkInputQuality(patientName: string, hospital: string): SpamCheckResult {
  // Check for gibberish / too short
  if (patientName.trim().length < 2) {
    return { allowed: false, reason: "Patient name is too short." };
  }
  if (hospital.trim().length < 3) {
    return { allowed: false, reason: "Hospital name is too short." };
  }
  // Check for repeated characters (e.g. "aaaa")
  if (/^(.)\1{3,}$/.test(patientName.trim()) || /^(.)\1{3,}$/.test(hospital.trim())) {
    return { allowed: false, reason: "Please enter a valid patient name and hospital." };
  }
  return { allowed: true };
}

export async function runSpamChecks(
  phone: string,
  bloodGroup: string,
  patientName: string,
  hospital: string
): Promise<SpamCheckResult> {
  // 1. Input quality
  const quality = checkInputQuality(patientName, hospital);
  if (!quality.allowed) return quality;

  // 2. Local cooldown
  const cooldown = checkLocalCooldown();
  if (!cooldown.allowed) return cooldown;

  // 3. Duplicate check
  const dup = await checkDuplicateRequest(phone, bloodGroup);
  if (!dup.allowed) return dup;

  // 4. Daily limit
  const daily = await checkDailyLimit(phone);
  if (!daily.allowed) return daily;

  return { allowed: true };
}

export function markRequestPosted() {
  localStorage.setItem(LOCAL_KEY, Date.now().toString());
}
