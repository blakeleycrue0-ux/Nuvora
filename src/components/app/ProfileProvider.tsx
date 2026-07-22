"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { Profile } from "@/lib/types";

interface MinimalUser {
  id: string;
  email: string | null;
}

interface ProfileContextValue {
  user: MinimalUser | null;
  profile: Profile | null;
  loading: boolean;
  isPro: boolean;
  refresh: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextValue>({
  user: null,
  profile: null,
  loading: true,
  isPro: false,
  refresh: async () => {},
});

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MinimalUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Read the profile through the server (/api/me). The server always has the
  // session cookie and env vars at runtime, so this avoids every client-side
  // Supabase/RLS/cookie edge case — it's the same read that works in the app's
  // API routes and proxy.
  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/me", { cache: "no-store" });
      const data = await res.json();
      if (data?.authenticated) {
        setUser({ id: data.userId, email: data.email ?? null });
        setProfile((data.profile as Profile) ?? null);
      } else {
        setUser(null);
        setProfile(null);
      }
    } catch {
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetch, state set only after awaiting
    load();
  }, [load]);

  return (
    <ProfileContext.Provider
      value={{ user, profile, loading, isPro: profile?.is_pro ?? false, refresh: load }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  return useContext(ProfileContext);
}
