/**
 * Normalize a Bangladesh phone number for WhatsApp links.
 * 01XXXXXXXXX → 8801XXXXXXXXX
 */
export function normalizeBDPhone(phone: string): string {
  // Strip everything except digits
  let digits = phone.replace(/[^0-9]/g, "");

  // Remove leading + duplicates already stripped, but handle 00880 prefix
  if (digits.startsWith("00880")) {
    digits = digits.slice(2); // 00880 → 880...
  }

  // If already has 880 prefix, keep it
  if (digits.startsWith("880") && digits.length >= 13) {
    return digits;
  }

  // Local format: 01XXXXXXXXX → 8801XXXXXXXXX
  if (digits.startsWith("0") && digits.length === 11) {
    return "880" + digits.slice(1);
  }

  // If it's 1XXXXXXXXX (10 digits, no leading 0)
  if (digits.startsWith("1") && digits.length === 10) {
    return "880" + digits;
  }

  // Already international or unknown format — return as-is
  return digits;
}

export function waLink(phone: string): string {
  return `https://wa.me/${normalizeBDPhone(phone)}`;
}
