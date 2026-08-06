import { LayoutGrid, ListChecks, Users, BarChart3, Settings } from "lucide-react";
import { FEATURE_TEAMS } from "@/lib/features";

// Personal-first navigation, focused on habits & progress. The mascot is
// intentionally secondary — reachable from the Home companion card, not the
// primary nav. The Team item only appears when Teams is enabled.
export const navItems = [
  { href: "/dashboard", label: "Home", icon: LayoutGrid },
  { href: "/habits", label: "Habits", icon: ListChecks },
  ...(FEATURE_TEAMS ? [{ href: "/team", label: "Team", icon: Users }] : []),
  { href: "/progress", label: "Progress", icon: BarChart3 },
  { href: "/settings", label: "Profile", icon: Settings },
] as const;
