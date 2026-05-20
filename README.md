# Continuity — Personal AI Skin & Supplements Checker

Single-user PWA for long-term tracking of skincare, supplements, habits, routine,
menstrual cycle, mood, daily observations, and a calendar of check-offs — with
prompt-style AI assistance.

## Stack

- **Next.js 16** (App Router, TypeScript, Tailwind v4, Turbopack)
- **Supabase** — Postgres, magic-link auth, RLS
- **Netlify** — deploy
- **PWA** — `manifest.json` + `display: standalone` → iPhone home screen
- **i18n** — Czech (default) + English, cookie-based locale switcher
- **Email allowlist** — only specific email(s) can sign in (single-user app)
- **Module toggles** — every feature (products, supplements, habits, routine,
  observations, cycle, mood+notes, AI) can be turned off in `/settings`

## Local setup

1. Install deps:

   ```bash
   npm install
   ```

2. Copy env example and fill in values:

   ```bash
   cp .env.local.example .env.local
   ```

   Required variables:

   | Var | Where to find it |
   | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → **Settings → API** → Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → **Settings → API** → `anon` `public` key |
   | `ALLOWED_EMAILS` | Comma-separated emails allowed to sign in. **Empty = open to everyone (dev only).** |

3. Run the dev server:

   ```bash
   npm run dev
   ```

   Open <http://localhost:3000>.

## Supabase setup

1. Create a project at <https://supabase.com>.
2. **Auth → URL Configuration → Redirect URLs**: add **every** environment you'll
   sign in from. The app builds `emailRedirectTo` dynamically from the request
   host — if a URL isn't whitelisted here, the magic-link email won't arrive.
   Add at minimum:
   - `http://localhost:3000/auth/callback` — local dev
   - `https://<your-site>.netlify.app/auth/callback` — production
3. **Auth → URL Configuration → Site URL**: set to your **production** URL
   (`https://<your-site>.netlify.app`). Supabase uses Site URL as the fallback
   for any redirect that's not in the whitelist.
4. **Auth → Settings**: set JWT expiry to `31536000` (1 year) — permanent login
   on iPhone.
5. **After your account exists**: **Auth → Providers → Email** → turn **off**
   *"Allow new users to sign up"*. Defense-in-depth alongside the app allowlist.
6. **SQL Editor**: run `supabase/migrations/0001_initial_schema.sql` —
   one file with the full schema (tables, indexes, RLS policies, triggers).

> **Heads-up when adding a new environment** (preview deploy, custom domain,
> moving from localhost to production…): the magic link will **silently** stop
> working until you add the new `…/auth/callback` URL to **Redirect URLs**.
> If a sign-in attempt seems to do nothing, that's the first thing to check.

## Email allowlist (security)

`ALLOWED_EMAILS` is enforced in three places:

1. **Login server action** (`app/_actions/login.ts`) — rejects non-allowed emails
   before calling Supabase. UX feedback only.
2. **`/auth/callback`** — after `exchangeCodeForSession`, verifies `user.email` and
   signs out if not allowed. This is the actual security boundary.
3. **Supabase “Allow new sign-ups” off** — prevents new accounts at the auth provider.

Anon key is public (it's in the browser bundle), so anyone could theoretically call
`signInWithOtp` from outside the app. Layers 2 and 3 catch that.

## Project structure

```text
app/
  layout.tsx                  ← PWA meta + I18nProvider + theme + accent
  page.tsx                    ← magic-link login (server action)
  globals.css                 ← Tailwind + safe-area + mobile tap targets
  _components/
    locale-switcher.tsx       ← CS/EN toggle
    top-nav.tsx               ← shared header (Continuity logo + locale + menu)
    nav-drawer.tsx            ← hamburger drawer (portal, module-gated)
    back-to-dashboard.tsx     ← home-icon on mobile, text on desktop
  _actions/login.ts           ← server action with allowlist check
  auth/
    callback/route.ts         ← OTP exchange + allowlist enforcement
    signout/route.ts          ← sign-out endpoint
  profile/                    ← About me (name, DOB, gender, skin types,
                                 lifestyle, children_count)
  dashboard/                  ← Today's summary card + AI prompt picks
    loading.tsx               ← skeleton shown while data loads
  settings/                   ← theme + accent + per-module on/off (instant-apply)
  library/
    products/                 ← skincare library (products + types + brands)
    supplements/              ← supplements library
    habits/                   ← habits library
    observations/             ← "Pozorování" — user tags filled also from calendar
  routine/                    ← morning / afternoon / evening template
  calendar/                   ← month / week / day toggle (persisted on profile)
    page.tsx, [date]/page.tsx ← grid + per-day editor
  ai/                         ← prompt generator (skincare, supplements,
                                 correlation, weekly)
    page.tsx, [type]/page.tsx
lib/
  supabase/                   ← server + client SDK helpers
  i18n/                       ← cs + en dictionary, locale cookie
  modules.ts                  ← module flag helpers (getModuleFlags, requireModule)
  calendar.ts                 ← month/week date math + mood colour
  theme.ts                    ← accent palette + helpers (light/dark)
  ai-prompts.ts               ← server-side prompt builders (4 types)
  types.ts                    ← DB row types
  skin-types.ts               ← preset skin types + gender constants
  auth-allowlist.ts           ← ALLOWED_EMAILS parser + check
proxy.ts                      ← Next.js 16 auth proxy
supabase/migrations/
  0001_initial_schema.sql     ← full schema in one file (run once for fresh install)
public/                       ← manifest.json + icons
```

## Data model (overview)

See files in `supabase/migrations/` for the source of truth.

| Table | Purpose |
| --- | --- |
| `profile` | 1 row per user — name, DOB, gender, skin_types[], lifestyle, children_count, theme, accent, `module_*` flags, `calendar_view` |
| `product_types` / `product_brands` | user-managed taxonomy for the skincare library |
| `products` | skincare library — name, brand, type, active_ingredients, INCI, notes |
| `supplement_types` / `supplement_brands` | same for supplements |
| `supplements` | supplements library — name, brand, type, dosage, purpose, ingredients |
| `habits` | non-product care items (flossing, exercise, …) |
| `tags` | "Pozorování" library — name, category, color |
| `routine_items` | template: *"this item is done at this slot, this position"* (archive-aware) |
| `daily_log` | check-offs: *date + slot + kind + product/supplement/habit reference* |
| `daily_notes` | mood (1–5) + free-form per day |
| `cycle_log` | menstruation per day with intensity (light/medium/heavy) |
| `daily_tags` | per-day many-to-many between `daily_log` dates and `tags` |

All tables have RLS — every row references `user_id` with `auth.uid()` default and an
*"own rows"* policy.

## iPhone install (PWA)

Open the deployed URL in Safari → **Share → Add to Home Screen**.
The app launches standalone (no browser chrome), uses safe-area-insets and 44px+
tap targets for native feel.

## Deploy to Netlify

1. Push to GitHub.
2. Netlify → New site from Git → select repo → defaults work (Next.js auto-detected).
3. **Site settings → Environment variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `ALLOWED_EMAILS`
4. **After first deploy** — open Supabase **Auth → URL Configuration** and:
   - Add `https://<your-site>.netlify.app/auth/callback` to **Redirect URLs**
   - Update **Site URL** to `https://<your-site>.netlify.app`

   Without this step, the magic link from production silently fails — Supabase
   blocks the redirect to a non-whitelisted host. The same applies whenever you
   add a new environment (preview deploys, custom domain, …).

## Status

- [x] Auth (magic link + email allowlist)
- [x] CS / EN i18n + locale cookie
- [x] Mobile-first styles (safe-area, 44px taps, sticky action bars)
- [x] PWA manifest + icons + home-screen install
- [x] Profile (name, DOB, gender, lifestyle, children, custom skin types)
- [x] Skincare library (products + types + brands, INCI, active ingredients)
- [x] Supplements library (with types + brands + dosage + ingredients)
- [x] Habits library
- [x] Observations ("Pozorování") library + tags from calendar
- [x] Routine items template (morning / afternoon / evening)
- [x] Calendar — month / week / day view (persisted), mood bg + period dot + log icon
- [x] Day editor — mood, period intensity, routine checklist, tags, notes
- [x] Settings — light/dark theme + 3 accent colours + per-module on/off (instant)
- [x] Hamburger nav drawer (module-gated)
- [x] AI prompt generator — 4 types (skincare, supplements, correlation, weekly),
      copy-paste flow with editable textarea and sticky buttons
- [ ] AI API integration (currently copy-paste only)
- [ ] Stats / charts page
