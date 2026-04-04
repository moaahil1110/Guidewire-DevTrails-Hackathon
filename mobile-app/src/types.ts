export type CoverageTier = "basic" | "shield" | "max";

export type DisruptionType =
  | "heavy_rain"
  | "extreme_heat"
  | "flood"
  | "curfew"
  | "platform_downtime";

export type TokenResponse = {
  access_token: string;
  token_type: string;
};

export type User = {
  id: number;
  full_name: string;
  email: string;
  phone_number: string;
  city: string;
  zone: string;
  pincode: string;
  platform: string;
  avg_daily_earnings: number;
  avg_hourly_earnings: number;
  risk_score: number;
  created_at: string;
};

export type PremiumQuote = {
  tier: CoverageTier;
  base_premium: number;
  premium: number;
  max_weekly_payout: number;
  weather_only: boolean;
  social_disruption_cover: boolean;
  extended_hours: boolean;
  forecast_risk_multiplier: number;
  zone_risk_multiplier: number;
  recommended: boolean;
};

export type Policy = {
  id: number;
  tier: CoverageTier;
  weekly_premium: number;
  max_weekly_payout: number;
  weather_only: boolean;
  social_disruption_cover: boolean;
  extended_hours: boolean;
  status: string;
  coverage_start: string;
  coverage_end: string;
  created_at: string;
};

export type Claim = {
  id: number;
  policy_id: number;
  disruption_type: DisruptionType;
  blocked_hours: number;
  payout_amount: number;
  status: string;
  fraud_score: number;
  trigger_source: string;
  payout_reference: string | null;
  created_at: string;
};

export type TriggerEvaluation = {
  triggered: boolean;
  disruption_type: DisruptionType | null;
  reason: string;
  source: string;
  claim: Claim | null;
  weather_snapshot: Record<string, unknown>;
};

export type RegisterPayload = {
  full_name: string;
  email: string;
  phone_number: string;
  password: string;
  city: string;
  zone: string;
  pincode: string;
  platform: string;
  avg_daily_earnings: number;
};
