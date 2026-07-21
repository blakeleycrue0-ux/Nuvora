"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";

interface ProfileContextValue {
  user: User | null;
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
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUser(user);

    if (user) {
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      setProfile((data as Profile) ?? null);
    } else {
      setProfile(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial async fetch on mount, state set only after awaiting Supabase
    load();
    const supabase = createClient();
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      load();
    });
    return () => sub.subscription.unsubscribe();
  }, []);

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
