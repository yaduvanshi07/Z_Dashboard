"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api, setStoredToken } from "./api";

const AuthContext = createContext(null);

const STORAGE_USER = "fd_user";

function readStoredUser() {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_USER);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUser(readStoredUser());
    setReady(true);
  }, []);

  const persistUser = useCallback((next) => {
    setUser(next);
    if (typeof window === "undefined") return;
    if (next) sessionStorage.setItem(STORAGE_USER, JSON.stringify(next));
    else sessionStorage.removeItem(STORAGE_USER);
  }, []);

  const login = useCallback(
    async (email, password) => {
      const res = await api("/auth/login", {
        method: "POST",
        body: { email, password },
        skipAuth: true,
      });
      const { user: u, token } = res.data;
      setStoredToken(token);
      persistUser(u);
      return u;
    },
    [persistUser]
  );

  const register = useCallback(
    async (payload) => {
      const res = await api("/auth/register", {
        method: "POST",
        body: payload,
        skipAuth: true,
      });
      const { user: u, token } = res.data;
      setStoredToken(token);
      persistUser(u);
      return u;
    },
    [persistUser]
  );

  const logout = useCallback(() => {
    setStoredToken(null);
    persistUser(null);
  }, [persistUser]);

  const refreshMe = useCallback(async () => {
    const res = await api("/auth/me");
    persistUser(res.data.user);
    return res.data.user;
  }, [persistUser]);

  const value = useMemo(
    () => ({
      user,
      ready,
      login,
      register,
      logout,
      refreshMe,
      isAnalystUp: user && (user.role === "Analyst" || user.role === "Admin"),
      isAdmin: user && user.role === "Admin",
    }),
    [user, ready, login, register, logout, refreshMe]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
