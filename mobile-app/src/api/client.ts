import {
  Claim,
  CoverageTier,
  DisruptionType,
  Policy,
  PremiumQuote,
  RegisterPayload,
  TokenResponse,
  TriggerEvaluation,
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

const REQUEST_TIMEOUT_MS = 10000;

async function parseError(response: Response): Promise<string> {
  try {
    const payload = await response.json();
    if (typeof payload?.detail === "string") {
      return payload.detail;
    }
    if (Array.isArray(payload?.detail)) {
      return payload.detail
        .map((entry: { msg?: string }) => entry?.msg)
        .filter(Boolean)
        .join(", ");
    }
  } catch {
    // Fall through to text parsing below.
  }

  try {
    const text = await response.text();
    return text || "Request failed";
  } catch {
    return "Request failed";
  }
}

async function fetchWithTimeout(input: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Request timed out. Please try again.");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetchWithTimeout(`${API_URL}${path}`, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const message = await parseError(response);
    throw new Error(message || "Request failed");
  }

  return response.json() as Promise<T>;
}

export const api = {
  register: (payload: RegisterPayload) =>
    request<TokenResponse>("/auth/register", { method: "POST", body: payload }),
  login: (email: string, password: string) =>
    request<TokenResponse>("/auth/login", {
      method: "POST",
      body: { email, password },
    }),
  me: (token: string) => request<User>("/auth/me", { token }),
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
