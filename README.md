# Nuvora

One app. Everything your health needs.

Nuvora is a premium AI-powered fitness and nutrition platform that replaces the
folder of separate apps most people use to track workouts, nutrition, calories,
progress and habits.

## Stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- Tailwind CSS v4 (custom design system — see `src/app/globals.css`)
- [Supabase](https://supabase.com) for auth (Google + email magic link) and the
  user profile / onboarding data
- [Anthropic API](https://platform.claude.com) for AI-generated onboarding plans
- [Motion](https://motion.dev) for animation
- [Lucide](https://lucide.dev) for icons

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Backend setup (Supabase)

`.env.local` already has the project's Supabase URL and anon key. Two things
still need to happen in the Supabase dashboard before auth and onboarding work
end-to-end:

1. **Run the schema migration.** Open the SQL editor in the Supabase dashboard
   and run `supabase/migrations/0001_init.sql`. This creates the `profiles`
   table (onboarding fields, `is_pro` flag, generated `plan`), enables row-level
   security, and adds a trigger that creates a profile row on sign-up.
2. **Enable the Google provider.** Authentication → Providers → Google, with a
   Google Cloud OAuth client ID/secret and the redirect URL Supabase shows you
   (`https://<project>.supabase.co/auth/v1/callback`). Until this is enabled,
   "Continue with Google" on `/login` will fail — the email magic-link option
   works without any extra setup.

## AI plan generation (optional)

The onboarding flow (`/onboarding`) posts to `/api/generate-plan`, which calls
Claude to build a personalized calorie/macro/workout plan. Add a server-side
`ANTHROPIC_API_KEY` to `.env.local` to enable this — **never** prefix it with
`NEXT_PUBLIC_`, and never paste it into chat. Without a key, onboarding still
works: it falls back to a deterministic Mifflin-St Jeor calculation
(`src/lib/plan-calculator.ts`).

## Structure

- `src/app` — routes: marketing landing page (`/`), auth (`/login`,
  `/auth/callback`), `/onboarding`, and the app (`/dashboard`, `/workouts`,
  `/nutrition`, `/progress`, `/coach`)
- `src/app/api/generate-plan` — server route calling Claude (with fallback)
- `src/components/ui` — reusable primitives (Button, Card, Input, charts, etc.)
- `src/components/app` — app shell, sidebar, bottom nav, stat cards,
  `ProfileProvider`/`useProfile` (current user + `is_pro`), `UpgradeModal`
- `src/components/marketing` — landing page sections
- `src/lib/supabase` — browser/server Supabase clients + proxy session helper
- `src/lib/mock-data.ts` — mock data powering the day-to-day app screens
  (dashboard, workouts, nutrition, progress); only auth + onboarding are
  backed by real data so far

## Pro gating

`is_pro` on the `profiles` table gates: barcode scanning, AI meal-photo
scanning, and unlimited AI Coach messages (free tier gets 5/day). There's no
payment processor wired up yet — the pricing page and in-app upgrade prompts
link to `/#pricing`. Flip `is_pro` to `true` on a profile row manually in
Supabase to test the Pro experience.
