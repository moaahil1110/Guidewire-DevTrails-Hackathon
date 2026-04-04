import type { Claim, CoverageTier, DisruptionType, Policy, PremiumQuote } from '../types';

const tierLabels: Record<CoverageTier, string> = {
  basic: 'Basic',
  shield: 'Shield',
  max: 'Max',
};

const disruptionLabels: Record<DisruptionType, string> = {
  heavy_rain: 'Heavy Rain',
  extreme_heat: 'Extreme Heat',
  flood: 'Flash Flood',
  curfew: 'Local Curfew',
  platform_downtime: 'Platform Down',
};

const disruptionCodes: Record<DisruptionType, string> = {
  heavy_rain: 'RN',
  extreme_heat: 'HT',
  flood: 'FF',
  curfew: 'CW',
  platform_downtime: 'PD',
};

export function formatCurrency(value: number | null | undefined) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '₹ --';
  }

  return `₹${Math.round(value).toLocaleString('en-IN')}`;
}

export function formatDate(value: string | null | undefined) {
  if (!value) {
    return '--';
  }

  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function getTierLabel(tier: CoverageTier | string | null | undefined) {
  if (!tier) return '--';
  return tierLabels[tier as CoverageTier] || String(tier);
}

export function getDisruptionLabel(type: DisruptionType | string | null | undefined) {
  if (!type) return '--';
  return disruptionLabels[type as DisruptionType] || String(type);
}

export function getDisruptionCode(type: DisruptionType) {
  return disruptionCodes[type];
}

export function getDisplayedQuotePrice(tier: CoverageTier, quote?: PremiumQuote | null) {
  if (tier === 'basic') return 29;
  return quote?.premium ?? null;
}

export function getDisplayedPolicyPrice(policy?: Policy | null) {
  if (!policy) return null;
  if (policy.tier === 'basic') return 29;
  return policy.weekly_premium;
}

export function getCoverageDaysRemaining(policy?: Policy | null) {
  if (!policy) return null;
  const diff = new Date(policy.coverage_end).getTime() - Date.now();
  if (diff <= 0) return 'Ended';
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return `${days} day${days === 1 ? '' : 's'} left`;
}

export function getClaimStatus(claim: Claim, releaseAt?: number, now = Date.now()) {
  if (releaseAt && releaseAt > now) {
    return {
      label: 'Under Review',
      detail: `verifying in ${Math.max(Math.ceil((releaseAt - now) / 1000), 0)}s`,
      tone: 'warning' as const,
    };
  }

  if (claim.status.toLowerCase() === 'paid') {
    return { label: 'Credited', detail: 'settled', tone: 'success' as const };
  }

  return { label: claim.status, detail: claim.status, tone: 'info' as const };
}
