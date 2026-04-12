export type RankBadge = "Best Match" | "Rare Hero" | "Trusted Donor";

const RARE_GROUPS = ["O-", "A-", "B-", "AB-"];

interface RankableDonor {
  blood_group: string;
  current_area: string | null;
  available_now: boolean;
  last_donation_date: string | null;
  created_at: string;
  donation_count?: number;
}

interface RankingContext {
  targetBloodGroup?: string;
  targetArea?: string;
}

export function computeDonorScore(donor: RankableDonor, ctx: RankingContext): number {
  let score = 0;

  // Exact blood group match (+50)
  if (ctx.targetBloodGroup && donor.blood_group === ctx.targetBloodGroup) score += 50;

  // Available now (+30)
  if (donor.available_now) score += 30;

  // Same nearby area (+20)
  if (ctx.targetArea && donor.current_area?.toLowerCase().includes(ctx.targetArea.toLowerCase())) score += 20;

  // 90+ days since last donation (+15)
  if (donor.last_donation_date) {
    const daysSince = Math.floor((Date.now() - new Date(donor.last_donation_date).getTime()) / (86400000));
    if (daysSince >= 90) score += 15;
    else score -= 10; // recently donated = lower
  } else {
    score += 10; // never donated = eligible
  }

  // Rare blood bonus (+10)
  if (RARE_GROUPS.includes(donor.blood_group)) score += 10;

  // Donation count bonus
  if (donor.donation_count && donor.donation_count > 0) {
    score += Math.min(donor.donation_count * 5, 25); // max +25
  }

  return score;
}

export function getDonorBadges(donor: RankableDonor, rank: number): RankBadge[] {
  const badges: RankBadge[] = [];

  if (rank === 0) badges.push("Best Match");
  if (RARE_GROUPS.includes(donor.blood_group)) badges.push("Rare Hero");
  if ((donor.donation_count ?? 0) >= 3) badges.push("Trusted Donor");

  return badges;
}

export function rankDonors<T extends RankableDonor>(donors: T[], ctx: RankingContext): T[] {
  return [...donors].sort((a, b) => computeDonorScore(b, ctx) - computeDonorScore(a, ctx));
}
