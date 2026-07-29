import { LayoutGrid, ListChecks, Users, BarChart3, Settings } from "lucide-react";

export const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/habits", label: "Habits", icon: ListChecks },
  { href: "/team", label: "Team", icon: Users },
  { href: "/progress", label: "Progress", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;
