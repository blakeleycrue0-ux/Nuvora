import { redirect } from "next/navigation";

// Nuvora is a personal app, not a public marketing site — proxy.ts already
// routes "/" to /login, /onboarding, or /dashboard based on auth state.
// This is just the fallback if a request ever reaches the route directly.
export default function RootPage() {
  redirect("/login");
}
