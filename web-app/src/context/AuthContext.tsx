/* eslint-disable react-refresh/only-export-components */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { api, ApiError } from "../api/client";
import type { RegisterPayload, UpdateProfilePayload, User } from "../types";

const STORAGE_KEY = "insureit-web-token";

type AuthContextValue = {
  token: string | null;
  user: User | null;
  bootstrapping: boolean;
  authError: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  updateProfile: (payload: UpdateProfilePayload) => Promise<void>;
  refreshUser: () => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [bootstrapping, setBootstrapping] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const clearSession = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const loadUser = useCallback(
    async (nextToken: string) => {
      const profile = await api.me(nextToken);
      setUser(profile);
      setAuthError(null);
    },
    [],
  );

  useEffect(() => {
    const bootstrap = async () => {
      const storedToken = localStorage.getItem(STORAGE_KEY);
      if (!storedToken) {
        setBootstrapping(false);
        return;
      }

      setToken(storedToken);
      try {
        await loadUser(storedToken);
      } catch (error) {
        clearSession();
        setAuthError(error instanceof Error ? error.message : "Failed to restore session.");
      } finally {
        setBootstrapping(false);
      }
    };

    void bootstrap();
  }, [clearSession, loadUser]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const result = await api.login(email, password);
      localStorage.setItem(STORAGE_KEY, result.access_token);
      setToken(result.access_token);
      await loadUser(result.access_token);
    },
    [loadUser],
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const result = await api.register(payload);
      localStorage.setItem(STORAGE_KEY, result.access_token);
      setToken(result.access_token);
      await loadUser(result.access_token);
    },
    [loadUser],
  );

  const updateProfile = useCallback(
    async (payload: UpdateProfilePayload) => {
      if (!token) {
        throw new Error("No active session.");
      }
      const updatedUser = await api.updateProfile(token, payload);
      setUser(updatedUser);
    },
    [token],
  );

  const refreshUser = useCallback(async () => {
    if (!token) {
      return;
    }
    try {
      await loadUser(token);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        clearSession();
      }
      throw error;
    }
  }, [clearSession, loadUser, token]);

  const signOut = useCallback(() => {
    clearSession();
    setAuthError(null);
  }, [clearSession]);

  const value = useMemo(
    () => ({
      token,
      user,
      bootstrapping,
      authError,
      signIn,
      register,
      updateProfile,
      refreshUser,
      signOut,
    }),
    [authError, bootstrapping, refreshUser, register, signIn, signOut, token, updateProfile, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }
  return context;
}
