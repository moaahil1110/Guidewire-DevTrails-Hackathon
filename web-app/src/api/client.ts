import axios from "axios";

import type {
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
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ||
  FALLBACK_API_URL;

export class ApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const client = axios.create({
  baseURL: API_URL,
  timeout: 10_000,
  headers: {
    "Content-Type": "application/json",
  },
});

function getErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;
    if (typeof detail === "string") {
      return detail;
    }
    if (Array.isArray(detail)) {
      return detail.map((item) => item.msg || item.message || "Validation error").join(", ");
    }
    if (typeof error.response?.data === "string" && error.response.data.trim()) {
      return error.response.data;
    }
    if (!error.response) {
      return "Connection failed. Is the backend running?";
    }
    return error.message || "Request failed";
  }

  return error instanceof Error ? error.message : "Request failed";
}

async function request<T>(
  path: string,
  options: {
    method?: "GET" | "POST" | "PUT";
    token?: string | null;
    body?: unknown;
  } = {},
) {
  try {
    const response = await client.request<T>({
      url: path,
      method: options.method ?? "GET",
      data: options.body,
      headers: options.token ? { Authorization: `Bearer ${options.token}` } : undefined,
    });
    return response.data;
  } catch (error) {
    throw new ApiError(
      getErrorMessage(error),
      axios.isAxiosError(error) ? error.response?.status : undefined,
    );
  }
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
        trigger_source: "web-dashboard",
      },
    }),
};
