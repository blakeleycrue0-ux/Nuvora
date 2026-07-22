"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "light" | "dark";

interface ThemeValue {
  theme: Theme;
  toggle: () => void;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeValue>({ theme: "dark", toggle: () => {}, setTheme: () => {} });

// Dark (black + gold) is the default. Light is an opt-in via the `.light` class.
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");

  useEffect(() => {
    // Hydrate the theme from localStorage after mount (SSR can't read it).
    const saved = (typeof localStorage !== "undefined" && localStorage.getItem("momentum-theme")) as Theme | null;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setThemeState(saved === "light" ? "light" : "dark");
  }, []);

  const apply = (t: Theme) => {
    const root = document.documentElement;
    if (t === "light") root.classList.add("light");
    else root.classList.remove("light");
    try {
      localStorage.setItem("momentum-theme", t);
    } catch {}
  };

  const setTheme = (t: Theme) => {
    setThemeState(t);
    apply(t);
  };

  const toggle = () => setTheme(theme === "dark" ? "light" : "dark");

  return <ThemeContext.Provider value={{ theme, toggle, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
