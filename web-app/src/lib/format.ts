import type { Claim, CoverageTier, DisruptionType, Policy, PremiumQuote } from "../types";

const tierLabels: Record<CoverageTier, string> = {
  basic: "Basic",
  shield: "Shield",
  max: "Max",
};

const disruptionLabels: Record<DisruptionType, string> = {
  heavy_rain: "Heavy Rain",
  extreme_heat: "Extreme Heat",
  flood: "Flash Flood",
  curfew: "Local Curfew",
  platform_downtime: "Platform Down",
};

export function formatCurrency(value: number | null | undefined) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "₹ --";
  }

  return `₹ ${Math.round(value).toLocaleString("en-IN")}`;
}

export function formatDate(value: string | null | undefined, options?: Intl.DateTimeFormatOptions) {
  if (!value) {
    return "--";
  }

  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...options,
  });
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return "--";
  }

  return new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) {
    return "Good morning";
  }
  if (hour < 17) {
    return "Good afternoon";
  }
  return "Good evening";
}

export function getTierLabel(tier: CoverageTier | string | null | undefined) {
  if (!tier) {
    return "No Plan";
  }

  return tierLabels[tier as CoverageTier] || String(tier);
}

export function getDisruptionLabel(disruptionType: DisruptionType | string | null | undefined) {
  if (!disruptionType) {
    return "--";
  }

  return disruptionLabels[disruptionType as DisruptionType] || String(disruptionType);
}

export function getCoverageDaysRemaining(policy: Policy | null) {
  if (!policy) {
    return null;
  }

  const now = Date.now();
  const end = new Date(policy.coverage_end).getTime();
  const diff = end - now;
  if (diff <= 0) {
    return "Coverage ended";
  }

  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return `${days} day${days === 1 ? "" : "s"} remaining`;
}

export function getDisplayedPolicyPrice(policy: Policy | null) {
  if (!policy) {
    return null;
  }
  if (policy.tier === "basic") {
    return 29;
  }
  return policy.weekly_premium;
}

export function getDisplayedQuotePrice(tier: CoverageTier, quote?: PremiumQuote | null) {
  if (tier === "basic") {
    return 29;
  }
  return quote?.premium ?? null;
}

export function getClaimStatusLabel(claim: Claim, releaseAt?: number, now = Date.now()) {
  if (releaseAt && releaseAt > now) {
    return `Under Review (${Math.max(Math.ceil((releaseAt - now) / 1000), 0)}s)`;
  }

  const normalized = claim.status.toLowerCase();
  if (normalized === "paid") {
    return "Credited";
  }
  return claim.status.replace(/_/g, " ");
}
