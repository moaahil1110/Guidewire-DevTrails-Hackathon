import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../api/client';
import { UpdateProfilePayload, User } from '../types';

interface AuthState {
  token: string | null;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: any) => Promise<void>;
  updateProfile: (payload: UpdateProfilePayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState>({
  token: null, user: null,
  login: async () => {}, register: async () => {}, updateProfile: async () => {}, logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('token').then(async (t) => {
      if (t) {
        setToken(t);
        try {
          const u = await api.me(t);
          setUser(u);
        } catch {
          AsyncStorage.removeItem('token');
        }
      }
    });
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.login(email, password);
    setToken(res.access_token);
    AsyncStorage.setItem('token', res.access_token);
    const u = await api.me(res.access_token);
    setUser(u);
  };

  const register = async (payload: any) => {
    const res = await api.register(payload);
    setToken(res.access_token);
    AsyncStorage.setItem('token', res.access_token);
    const u = await api.me(res.access_token);
    setUser(u);
  };

  const updateProfile = async (payload: UpdateProfilePayload) => {
    if (!token) {
      throw new Error('No active session');
    }
    const updated = await api.updateProfile(token, payload);
    setUser(updated);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    AsyncStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ token, user, login, register, updateProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
