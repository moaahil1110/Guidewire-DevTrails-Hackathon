import {
  Claim,
  CoverageTier,
  DisruptionType,
  Policy,
  PremiumQuote,
  RegisterPayload,
  TokenResponse,
  TriggerEvaluation,
  UpdateProfilePayload,
  User,
} from "../types";

const FALLBACK_API_URL = "http://localhost:8000";

export const API_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || FALLBACK_API_URL;

type RequestOptions = {
  method?: string;
  token?: string | null;
  body?: unknown;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Request failed");
  }

  return response.json() as Promise<T>;
}

async function loginRequest(email: string, password: string): Promise<TokenResponse> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Login failed");
  }

  return response.json() as Promise<TokenResponse>;
}

export const api = {
  register: (payload: RegisterPayload) =>
    request<TokenResponse>("/auth/register", { method: "POST", body: payload }),
  login: (email: string, password: string) =>
    loginRequest(email, password),
  me: (token: string) => request<User>("/auth/me", { token }),
  updateProfile: (token: string, payload: UpdateProfilePayload) =>
    request<User>("/auth/me", { method: "PUT", token, body: payload }),
  quote: (token: string, tier: CoverageTier, forecastRiskMultiplier = 1.1) =>
    request<PremiumQuote>("/premium/quote", {
      method: "POST",
      token,
      body: { tier, forecast_risk_multiplier: forecastRiskMultiplier },
    }),
  purchasePolicy: (token: string, tier: CoverageTier) =>
    request<Policy>("/policy/purchase", { method: "POST", token, body: { tier } }),
  activePolicy: (token: string) => request<Policy>("/policy/active", { token }),
  claims: (token: string) => request<Claim[]>("/claims", { token }),
  simulateTrigger: (token: string, disruptionType: DisruptionType, blockedHours: number) =>
    request<TriggerEvaluation>("/claims/simulate-trigger", {
      method: "POST",
      token,
      body: {
        disruption_type: disruptionType,
        blocked_hours: blockedHours,
        trigger_source: "react-native-demo",
      },
    }),
  weatherCheck: (token: string, lat: number, lon: number, blockedHours: number) =>
    request<TriggerEvaluation>("/weather/check-trigger", {
      method: "POST",
      token,
      body: {
        lat,
        lon,
        blocked_hours: blockedHours,
        force_mock: true,
      },
    }),
};
