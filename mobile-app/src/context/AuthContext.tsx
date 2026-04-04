import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

import { api } from "../api/client";
import { RegisterPayload, User } from "../types";

type AuthContextValue = {
  token: string | null;
  user: User | null;
  loading: boolean;
  authError: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const TOKEN_KEY = "insureit-token";

function normalizeErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message.replace(/^Error:\s*/, "");
  }
  return "Something went wrong.";
}

function isExpiredSessionError(message: string) {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("could not validate credentials") ||
    normalized.includes("401") ||
    normalized.includes("unauthorized")
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const clearSession = async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const storedToken = await AsyncStorage.getItem(TOKEN_KEY);
        if (!storedToken) {
          return;
        }

        setAuthError(null);
        setToken(storedToken);
        const profile = await api.me(storedToken);
        setUser(profile);
      } catch (error) {
        const message = normalizeErrorMessage(error);
        await clearSession();
        if (isExpiredSessionError(message)) {
          setAuthError("Your session expired. Please sign in again.");
        } else {
          setAuthError(`Could not restore session: ${message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  const hydrateSession = async (nextToken: string) => {
    setAuthError(null);
    await AsyncStorage.setItem(TOKEN_KEY, nextToken);
    setToken(nextToken);
    try {
      const profile = await api.me(nextToken);
      setUser(profile);
    } catch (error) {
      const message = normalizeErrorMessage(error);
      await clearSession();
      setAuthError(`Could not load profile: ${message}`);
      throw new Error(message);
    }
  };

  const signIn = async (email: string, password: string) => {
    setAuthError(null);
    const response = await api.login(email, password);
    await hydrateSession(response.access_token);
  };

  const register = async (payload: RegisterPayload) => {
    setAuthError(null);
    const response = await api.register(payload);
    await hydrateSession(response.access_token);
  };

  const refreshProfile = async () => {
    if (!token) {
      return;
    }

    try {
      const profile = await api.me(token);
      setUser(profile);
      setAuthError(null);
    } catch (error) {
      const message = normalizeErrorMessage(error);
      if (isExpiredSessionError(message)) {
        await clearSession();
        setAuthError("Your session expired. Please sign in again.");
        return;
      }
      setAuthError(`Could not refresh profile: ${message}`);
      throw error;
    }
  };

  const signOut = async () => {
    setAuthError(null);
    await clearSession();
  };

  return (
    <AuthContext.Provider
      value={{ token, user, loading, authError, signIn, register, refreshProfile, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
