import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { TeamsLanding } from "./TeamsLanding";
import { FEATURE_TEAMS } from "@/lib/features";

export const metadata: Metadata = {
  title: "Fenom para equipos — los hábitos que marcan la diferencia",
  description:
    "La app de hábitos para tu equipo. Para cualquier deporte, edad y nivel: descanso, nutrición, trabajo individual y mentalidad, con verificación por foto (IA), rachas, clasificación del grupo y privacidad real. Gratis para empezar.",
  openGraph: {
    title: "Fenom para equipos",
    description:
      "Lo que se hace entre entrenamientos también cuenta. La herramienta para clubes y entrenadores que quieren un equipo más constante y unido — cualquier deporte, cualquier edad.",
  },
  // "Secret" page: reachable by direct link (to share with clubs) but not
  // indexed by search engines and not listed in the sitemap.
  robots: { index: false, follow: false },
};

export default function TeamsPage() {
  // Teams marketing page is hidden in personal-only mode.
  if (!FEATURE_TEAMS) redirect("/");
  return <TeamsLanding />;
}
