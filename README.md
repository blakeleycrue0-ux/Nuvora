# Nuvora

One app. Everything your health needs.

Nuvora is a premium AI-powered fitness and nutrition platform that replaces the
folder of separate apps most people use to track workouts, nutrition, calories,
progress and habits.

## Stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- Tailwind CSS v4 (custom design system — see `src/app/globals.css`)
- [Motion](https://motion.dev) for animation
- [Lucide](https://lucide.dev) for icons

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Structure

- `src/app` — routes: marketing landing page (`/`), and the app (`/dashboard`,
  `/workouts`, `/nutrition`, `/progress`, `/coach`)
- `src/components/ui` — reusable primitives (Button, Card, Input, charts, etc.)
- `src/components/app` — app shell, sidebar, bottom nav, stat cards
- `src/components/marketing` — landing page sections
- `src/lib/mock-data.ts` — mock data powering the app screens

All app data is currently mocked client-side; there is no backend wired up yet.
