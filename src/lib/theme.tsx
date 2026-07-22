"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "light" | "dark";

interface ThemeValue {
  theme: Theme;
  toggle: () => void;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeValue>({ theme: "light", toggle: () => {}, setTheme: () => {} });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    // Hydrate the theme from localStorage after mount (SSR can't read it).
    const saved = (typeof localStorage !== "undefined" && localStorage.getItem("momentum-theme")) as Theme | null;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setThemeState(saved === "dark" ? "dark" : "light");
  }, []);

  const apply = (t: Theme) => {
    const root = document.documentElement;
    if (t === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
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
