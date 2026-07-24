# Momentum — Production & iOS-readiness audit

_Last updated: 2026-07-24_

Momentum is a Next.js 16 (App Router, React 19, Tailwind v4) habit tracker.
Auth and data run on Supabase; it's deployed on Netlify and installable as a PWA
with real web-push reminders.

---

## 1. Changes made (this pass)

- **Dead code removed**
  - Deleted unused `src/components/ui/Badge.tsx`.
  - Removed unused `AppleIcon` (the Apple sign-in button was already removed).
  - Removed unused `isOnboarded()` helper.
  - Uninstalled `playwright-core` (was only used for QA screenshots, never shipped).
- **Security headers** (`next.config.ts`): `X-Content-Type-Options`, `X-Frame-Options`,
  `Referrer-Policy`, `Permissions-Policy`, `Strict-Transport-Security`.
- **Caching**: immutable long-cache for `/_next/static/*`; `no-cache` for `/sw.js`
  so service-worker updates roll out immediately.
- **SEO**: added `robots.ts` (sitemap ref + app screens disallowed) and `sitemap.ts`;
  added Open Graph `url`/`siteName`, Twitter `summary_large_image` card, canonical URL,
  and keywords to the metadata.
- **Hardening**: `reactStrictMode`, `poweredByHeader: false`.

## 2. Problems found

| Area | Finding | Severity |
|---|---|---|
| Cleanup | Unused component/exports and a stray dev dependency | Low |
| Security | No HTTP security headers | Medium |
| SEO | No robots/sitemap, no Twitter card/canonical | Medium |
| Offline | Service worker has no offline caching | Medium |
| CSP | No Content-Security-Policy | Medium |
| Reminders | Push reminders depend on Supabase cron/function being live | High (external) |
| Medals/level | Achievements & level use vector icons, not game-style images | Low (UX) |
| iOS | Not yet wrapped for the App Store | High (for iOS goal) |

## 3. Problems fixed

- All cleanup items above (dead code, dep).
- Security headers added.
- SEO (robots, sitemap, canonical, OG, Twitter) added.
- Build passes with **0 TypeScript errors**; lint passes with **0 warnings**.
- Verified **no secrets in the repo**: `.env*` is git-ignored, nothing sensitive is
  committed. The only public values shipped in the bundle are the Supabase URL, the
  Supabase **anon** key, and the Google/VAPID **public** keys (all designed to be public).
  The VAPID **private** key lives only as a Supabase secret.

## 4. Problems pending (need manual work)

Ordered by priority:

1. **Verify push reminders end-to-end** (High). The client, table, Edge Function and
   cron are all in place; confirm in Supabase → Edge Functions → `send-reminders` → Logs
   that it runs each minute and returns `{"sent": n}`. Common causes if not firing:
   the cron job isn't scheduled, the `push_subscriptions` row is missing, or the
   reminder time/timezone doesn't match.
2. **iOS wrapper with Capacitor** (High, for the App Store goal). Not installed yet
   (as requested). See §9.
3. **Content-Security-Policy** (Medium). Left out to avoid breaking Supabase/Google/push;
   should be added with an explicit allow-list.
4. **Real offline mode** (Medium). The SW currently only enables install + push. Precache
   the app shell for a basic offline experience.
5. **Game-style medal & rank images** (Low/UX). Replace the vector achievement icons and
   level ring with generated trophy/rank images.

## 5. Recommendations (highest → lowest)

1. Confirm the reminders cron + function in Supabase (see §4.1).
2. Add Capacitor and build the iOS app (§9) once you have an Apple Developer account.
3. Add a tuned Content-Security-Policy.
4. Add offline precaching (app shell) to the service worker.
5. Consider a custom domain (e.g. `momentum.app`) and update `metadataBase`, manifest,
   Supabase redirect URLs, and Google origins accordingly.
6. Add automated tests (Playwright) for the core flows (auth, create/complete habit).

## 6. Security review

- **Env / keys**: no secrets committed; `.env*` ignored. Public keys only in the bundle.
- **Supabase**: Row Level Security is enabled on `habits`, `completions`, and
  `push_subscriptions`, each scoped to `auth.uid() = user_id`. Users can only read/write
  their own rows.
- **Auth**: Supabase Auth (email/password + Google OAuth, PKCE flow).
- **Headers**: added (see §1). CORS for Supabase is handled by Supabase itself.
- **Recommendation**: add CSP; rotate the anon key only if ever needed (it's public by design).

## 7. Quality

- `npm run build` — passes, all routes prerendered as static.
- `npm run lint` — passes with no warnings.
- TypeScript strict mode — no errors.

## 8. Accessibility / UX

- Icon-only buttons have `aria-label`s; forms use real labels/placeholders.
- Loading skeletons on dashboard/progress/habits; spinner on auth; empty states
  everywhere; reduced-motion is respected via CSS.
- Light + dark themes with adequate contrast.
- **Pending**: full audit with a screen reader; focus-visible states on a few custom controls.

## 9. iOS / Capacitor readiness

The app is a good Capacitor candidate: every route is client-rendered and statically
prerendered, storage is Supabase + `localStorage` (both fine in WKWebView), and there
are no server-only APIs.

To ship on iOS later:
- Add Capacitor (`@capacitor/core`, `@capacitor/ios`) and either
  (a) point `server.url` at the Netlify site, or (b) switch to `output: 'export'` and
  bundle the static build (note: `output: 'export'` disables `headers()`, so move those
  to Netlify `_headers` if you choose export).
- **Google sign-in** in a native webview should use `@capacitor/browser` /
  ASWebAuthenticationSession (not a plain in-app redirect); register the app's custom
  URL scheme in Supabase Auth redirect URLs.
- **Push on iOS** requires APNs via a native push plugin (`@capacitor/push-notifications`)
  — the current Web Push works in Safari/installed PWA but a native build uses APNs.
- Add native splash screens and app icons (the PWA icons can seed these).

## 10. App Store — what's still needed

- An **Apple Developer account** ($99/yr).
- A **Capacitor iOS project** built in Xcode (bundle id, signing, provisioning).
- App Store listing assets: screenshots, description, privacy policy URL, support URL.
- A **privacy policy** page (required; the app stores personal habit data).
- App Privacy "nutrition label" answers (data collected: email, habit data).
- Native push (APNs) if you want notifications inside the native app.

## 11. Final status

- **Production (web/PWA): ~85 / 100** — functional, secure, installable, SEO-ready,
  clean build. Remaining points: CSP, offline precache, reminders runtime confirmation.
- **iOS App Store readiness: ~55 / 100** — architecturally ready for Capacitor, but the
  native wrapper, Apple account, native push, and store assets are still required.
