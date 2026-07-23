import { createClient } from "@supabase/supabase-js";

// Both values are public (safe to ship in the bundle). These are hardcoded on
// purpose — do NOT read from env, so stale Netlify vars from an old project
// can't hijack the client and point it at the wrong Supabase project.
const SUPABASE_URL = "https://lxjdbtrubjczonpctdeq.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4amRidHJ1Ympjem9ucGN0ZGVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3ODcxNDYsImV4cCI6MjEwMDM2MzE0Nn0.2XqrJGuAV1zppuy_U5vaPmDqhcmv8Bh_lxSJSqIoDvA";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: "pkce",
  },
});
