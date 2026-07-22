import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Diagnostic endpoint: shows the current user's stored profile row so we can
// confirm what actually saved. Safe — only ever returns the caller's own data.
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return NextResponse.json(
    {
      authenticated: true,
      userId: user.id,
      email: user.email,
      profileExists: !!profile,
      profile,
      readError: error?.message ?? null,
    },
    { status: 200 },
  );
}
