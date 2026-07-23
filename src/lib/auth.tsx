"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, User as SupaUser } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export interface User {
  id: string;
  name: string;
  email: string;
  provider: string;
  avatarColor: string;
  avatar?: string; // profile photo URL (e.g. from Google)
}

export interface AuthResult {
  ok: boolean;
  needsConfirmation?: boolean;
  error?: string;
}

interface AuthValue {
  user: User | null;
  ready: boolean;
  signInWithEmail: (email: string, password: string) => Promise<AuthResult>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<AuthResult>;
  signInWithGoogle: () => Promise<AuthResult>;
  signOut: () => Promise<void>;
  updateUser: (patch: Partial<Pick<User, "name">>) => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

const AVATAR_COLORS = ["#45c68e", "#4fc3b8", "#67b0e0", "#7f8ce0", "#a58ce0", "#e0b45c"];

function colorFor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

function toUser(su: SupaUser): User {
  const meta = su.user_metadata || {};
  const email = su.email || "";
  const name =
    meta.full_name ||
    meta.name ||
    (email ? email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()) : "Friend");
  return {
    id: su.id,
    name,
    email,
    provider: su.app_metadata?.provider || "email",
    avatarColor: colorFor(su.id || email),
    avatar: meta.avatar_url || meta.picture || undefined,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    const apply = (session: Session | null) => {
      if (!active) return;
      setUser(session?.user ? toUser(session.user) : null);
    };
    supabase.auth.getSession().then(({ data }) => {
      apply(data.session);
      if (active) setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => apply(session));
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signInWithEmail = useCallback<AuthValue["signInWithEmail"]>(async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }, []);

  const signUpWithEmail = useCallback<AuthValue["signUpWithEmail"]>(async (email, password, name) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });
    if (error) return { ok: false, error: error.message };
    // If email confirmation is enabled, there's no session yet.
    if (!data.session) return { ok: true, needsConfirmation: true };
    return { ok: true };
  }, []);

  const signInWithGoogle = useCallback<AuthValue["signInWithGoogle"]>(async () => {
    const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/login` : undefined;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true }; // browser redirects to Google
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  const updateUser = useCallback<AuthValue["updateUser"]>(async (patch) => {
    if (patch.name !== undefined) {
      const { data, error } = await supabase.auth.updateUser({ data: { full_name: patch.name } });
      if (!error && data.user) setUser(toUser(data.user));
    }
  }, []);

  const value = useMemo<AuthValue>(
    () => ({ user, ready, signInWithEmail, signUpWithEmail, signInWithGoogle, signOut, updateUser }),
    [user, ready, signInWithEmail, signUpWithEmail, signInWithGoogle, signOut, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
