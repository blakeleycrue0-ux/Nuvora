import { Landing } from "@/components/landing/Landing";

// Public marketing landing at the root. The app itself lives under /dashboard
// (auth-gated); CTAs here route to /signup and /login.
export default function RootPage() {
  return <Landing />;
}
