"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export interface User {
  name: string;
  email: string;
  provider: "email" | "google" | "apple";
  avatarColor: string;
  avatar?: string; // profile photo URL (e.g. from Google)
}

interface AuthValue {
  user: User | null;
  ready: boolean;
  signIn: (email: string, name?: string, provider?: User["provider"], avatar?: string) => User;
  signOut: () => void;
  updateUser: (patch: Partial<User>) => void;
}

const AuthContext = createContext<AuthValue | null>(null);
const KEY = "momentum-user";

const AVATAR_COLORS = ["#45c68e", "#4fc3b8", "#67b0e0", "#7f8ce0", "#a58ce0", "#e0b45c"];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Hydrate the signed-in user from localStorage after mount (SSR can't read it).
    /* eslint-disable react-hooks/set-state-in-effect */
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {}
    setReady(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const persist = (u: User | null) => {
    try {
      if (u) localStorage.setItem(KEY, JSON.stringify(u));
      else localStorage.removeItem(KEY);
    } catch {}
  };

  const signIn = useCallback<AuthValue["signIn"]>((email, name, provider = "email", avatar) => {
    const derivedName = name || email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    const u: User = {
      name: derivedName || "Friend",
      email,
      provider,
      avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
      avatar,
    };
    setUser(u);
    persist(u);
    return u;
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    persist(null);
  }, []);

  const updateUser = useCallback<AuthValue["updateUser"]>((patch) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      persist(next);
      return next;
    });
  }, []);

  return <AuthContext.Provider value={{ user, ready, signIn, signOut, updateUser }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
