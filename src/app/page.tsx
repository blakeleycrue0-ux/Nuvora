import { redirect } from "next/navigation";

// No marketing landing — Momentum drops you straight into the app.
export default function RootPage() {
  redirect("/login");
}
