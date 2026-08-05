import { LayoutGrid, ListChecks, Users, BarChart3, Settings, PawPrint } from "lucide-react";
import { FEATURE_TEAMS } from "@/lib/features";

// Personal-first navigation. The Team item only appears when the Teams
// feature is enabled (see src/lib/features.ts) — in v1 it is hidden entirely.
export const navItems = [
  { href: "/dashboard", label: "Home", icon: LayoutGrid },
  { href: "/habits", label: "Habits", icon: ListChecks },
  ...(FEATURE_TEAMS ? [{ href: "/team", label: "Team", icon: Users }] : []),
  { href: "/progress", label: "Progress", icon: BarChart3 },
  { href: "/mascot", label: "Mascot", icon: PawPrint },
  { href: "/settings", label: "Profile", icon: Settings },
] as const;
