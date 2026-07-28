import type { Metadata } from "next";
import { TeamsLanding } from "./TeamsLanding";

export const metadata: Metadata = {
  title: "Momentum para Equipos — hábitos que ganan partidos",
  description:
    "La disciplina fuera del campo, medible. Momentum para Equipos ayuda a entrenadores y clubes a construir hábitos ganadores en sus jugadoras: verificación por foto con IA, rachas, liguilla del equipo y privacidad real. Gratis para empezar.",
  openGraph: {
    title: "Momentum para Equipos",
    description:
      "Hábitos que ganan partidos. La herramienta para entrenadores y clubes que quieren jugadoras más disciplinadas, unidas y motivadas.",
  },
};

export default function TeamsPage() {
  return <TeamsLanding />;
}
