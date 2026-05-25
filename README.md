# Continuity — Personal AI Skin & Supplements Checker

Single-user PWA for long-term tracking of skincare, supplements, habits, routine,
menstrual cycle, mood, daily observations, and a calendar of check-offs — with
prompt-style AI assistance.

## Stack

- **Vite 6 + React 19** (TypeScript, Tailwind v4)
- **TanStack Router v1** — code-based, type-safe SPA routing
- **TanStack Query v5** — server state, caching, invalidation
- **Supabase** — Postgres, magic-link auth, RLS (browser client only)
- **Netlify** — deploy (`public/_redirects` for SPA routing)
- **PWA** — `manifest.json` + `display: standalone` → iPhone home screen + manual `sw.js`
- **i18n** — Czech (default) + English, localStorage-based locale switcher
- **Email allowlist** — only specific email(s) can sign in (`VITE_ALLOWED_EMAILS`)
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
   | `VITE_SUPABASE_URL` | Supabase Dashboard → **Settings → API** → Project URL |
   | `VITE_SUPABASE_ANON_KEY` | Supabase Dashboard → **Settings → API** → `anon` `public` key |
   | `VITE_ALLOWED_EMAILS` | Comma-separated emails allowed to sign in. **Empty = open in dev, blocked in production.** |
   | `AI_API_KEY` | API key for the AI provider. **No `VITE_` prefix** — not exposed in the bundle. Currently unused (prompts are copy-paste only). |

3. Run the dev server:

   ```bash
   npm run dev
   ```

   Open <http://localhost:5173>.

## Supabase setup

1. Create a project at <https://supabase.com>.
2. **Auth → URL Configuration → Redirect URLs**: add **every** environment you'll
   sign in from. The app builds `emailRedirectTo` dynamically from `window.location.origin` —
   if a URL isn't whitelisted here, the magic-link email won't arrive.
   Add at minimum:
   - `http://localhost:5173/auth/callback` — local dev
   - `https://<your-site>.netlify.app/auth/callback` — production
3. **Auth → URL Configuration → Site URL**: set to your **production** URL
   (`https://<your-site>.netlify.app`).
4. **Auth → Settings**: set JWT expiry to `31536000` (1 year) — permanent login
   on iPhone.
5. **After your account exists**: **Auth → Providers → Email** → turn **off**
   *"Allow new users to sign up"*. Defense-in-depth alongside the app allowlist.
6. **SQL Editor**: run `supabase/migrations/0001_initial_schema.sql` —
   one file with the full schema (tables, indexes, RLS policies, triggers).

> **Heads-up when adding a new environment** (preview deploy, custom domain,
> moving from localhost to production…): the magic link will **silently** stop
> working until you add the new `…/auth/callback` URL to **Redirect URLs**.

## Email allowlist (security)

`VITE_ALLOWED_EMAILS` is enforced in two places:

1. **Login form** (`src/pages/LoginPage.tsx`) — rejects non-allowed emails
   before calling Supabase. UX feedback only.
2. **`/auth/callback`** (`src/pages/AuthCallback.tsx`) — after `exchangeCodeForSession`,
   verifies `user.email` and signs out if not allowed. This is the actual security boundary.

Anon key is public (it's in the browser bundle). Anyone could theoretically call
`signInWithOtp` from outside the app. Layer 2 catches that.

When `VITE_ALLOWED_EMAILS` is empty: open in development, **blocked in production**.

## Project structure

```text
src/
  main.tsx                    ← entry point: QueryClient + RouterProvider + Toaster
  fonts.css                   ← Geist variable font @font-face declarations
  router.tsx                  ← TanStack Router route tree (all routes defined here)
  vite-env.d.ts               ← import.meta.env types
  pages/
    LoginPage.tsx             ← magic-link login (OTP flow, browser-only)
    AuthCallback.tsx          ← OTP exchange + allowlist check + appearance seeding
    RootLayout.tsx            ← root layout with Outlet
    DashboardPage.tsx         ← today summary + module shortcuts
    ProfilePage.tsx           ← About me form
    SettingsPage.tsx          ← theme + accent + module toggles
    RoutinePage.tsx           ← morning / afternoon / evening template
    CalendarPage.tsx          ← month / week view (persisted on profile)
    CalendarDayPage.tsx       ← per-day editor (mood, period, routine, tags, notes)
    AiPage.tsx                ← tabs: predefined / custom prompts
    AiTypePage.tsx            ← predefined prompt (generate, edit, save/restore)
    AiCustomNewPage.tsx       ← create custom prompt
    AiCustomDetailPage.tsx    ← run custom prompt
    AiCustomEditPage.tsx      ← edit / delete custom prompt
    library/
      HabitsPage.tsx
      HabitDetailPage.tsx
      ObservationsPage.tsx
      ObservationDetailPage.tsx
      ProductsPage.tsx
      ProductDetailPage.tsx
      SupplementsPage.tsx
      SupplementDetailPage.tsx
app/
  globals.css                 ← Tailwind + safe-area + mobile tap targets
  _components/                ← shared UI components (no Next.js dependencies)
  ai/_components/             ← AiTabs, PromptEditor
  ai/custom/_components/      ← CustomPromptForm
  calendar/_components/       ← CalendarHeader, MonthView, WeekView, DayCell
  calendar/[date]/_components/← MoodPicker, PeriodPicker, RoutineChecklist,
                                 ObservationsPicker, NotesEditor
  library/*/  _components/    ← per-feature forms and lists
  profile/_components/        ← ProfileForm
  routine/_components/        ← RoutineTabs, SlotPanel
  settings/_components/       ← SettingsForm
  ai/_actions.ts              ← savePromptOverride / deletePromptOverride
  ai/custom/_actions.ts       ← createCustomPrompt / updateCustomPrompt / deleteCustomPrompt
  calendar/_actions.ts        ← setMood / setNotes / setCycle / toggleDailyLog /
                                 attachTag / detachTag / createAndAttachTag / setCalendarView
  library/*/  _actions.ts     ← add / update / delete per entity
  profile/_actions.ts         ← saveProfile
  routine/_actions.ts         ← addItem / updateItem / archiveItem / reorderItems
  settings/_actions.ts        ← saveSettings
lib/
  supabase/browser.ts         ← browser Supabase client (validates VITE_* env vars on init)
  i18n/                       ← cs + en dictionary, localStorage locale
  modules.ts                  ← getModuleFlags helper
  calendar.ts                 ← month/week date math + mood colour
  theme.ts                    ← accent palette + helpers
  appearance.ts               ← apply theme/accent to DOM + localStorage
  ai-prompts.ts               ← prompt builders (4 predefined + buildCustomPrompt)
  types.ts                    ← DB row types, DataBlock, CustomPrompt, ActionState
  skin-types.ts               ← preset skin types + gender constants
  auth-allowlist.ts           ← VITE_ALLOWED_EMAILS parser + check
  confirm-toast.tsx           ← shared confirmation toast (message + detail + confirm/cancel)
  with-delete.ts              ← shared delete handler (action → error check → invalidate → navigate → success)
app/
  _components/
    error-state.tsx           ← shared full-screen error fallback
    …
public/
  sw.js                       ← service worker: cache-first for assets, network-only for rest
  _redirects                  ← Netlify SPA fallback (also in netlify.toml)
  manifest.json + icons
netlify.toml                  ← build config + SPA redirect + SECRETS_SCAN_OMIT_KEYS
supabase/migrations/
  0001_initial_schema.sql     ← full schema in one file (run once for fresh install)
```

## Data model (overview)

See `supabase/migrations/` for the source of truth.

| Table | Purpose |
| --- | --- |
| `profile` | 1 row per user — name, DOB, gender, skin_types[], lifestyle, children_count, theme, accent, `module_*` flags, `calendar_view` |
| `product_types` / `product_brands` | user-managed taxonomy for the skincare library |
| `products` | skincare library — name, brand, type, active_ingredients, INCI, notes |
| `supplement_types` / `supplement_brands` | same for supplements |
| `supplements` | supplements library — name, brand, type, dosage, purpose, ingredients |
| `habits` | non-product care items (flossing, exercise, …) |
| `tags` | "Pozorování" library — name, category, color |
| `routine_items` | template: *"this item at this slot, this position"* (archive-aware) |
| `daily_log` | check-offs: *date + slot + kind + product/supplement/habit reference* |
| `daily_notes` | mood (1–5) + free-form per day |
| `cycle_log` | menstruation per day with intensity (light/medium/heavy) |
| `daily_tags` | per-day many-to-many between dates and `tags` |
| `prompt_overrides` | user-saved edits to predefined AI prompts (unique per user + prompt_type) |
| `custom_prompts` | user-created AI prompts with name, question, and selected data blocks |

All tables have RLS — every row references `user_id` with `auth.uid()` default and an
*"own rows"* policy.

## iPhone install (PWA)

Open the deployed URL in Safari → **Share → Add to Home Screen**.
The app launches standalone (no browser chrome), uses safe-area-insets and 44px+
tap targets for native feel.

## Deploy to Netlify

1. Push to GitHub.
2. Netlify → New site from Git → select repo.
3. Build command and publish directory are set in `netlify.toml` — no manual config needed.
4. **Environment variables** (Netlify UI → Site settings → Environment variables):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_ALLOWED_EMAILS`
   - `AI_API_KEY` *(optional — reserved for future AI integration)*

   > **Note:** `netlify.toml` sets `SECRETS_SCAN_OMIT_KEYS` for the three `VITE_*` vars.
   > Vite intentionally embeds them in the browser bundle — without this, Netlify's secrets
   > scanner would fail the build.

5. **After first deploy** — open Supabase **Auth → URL Configuration** and:
   - Add `https://<your-site>.netlify.app/auth/callback` to **Redirect URLs**
   - Update **Site URL** to `https://<your-site>.netlify.app`

   Without this step the magic link silently fails — Supabase blocks redirects
   to non-whitelisted hosts. Same applies whenever you add a new environment.

## Status

- [x] Auth (magic link + email allowlist)
- [x] CS / EN i18n + locale switcher
- [x] Mobile-first styles (safe-area, 44px taps, sticky action bars)
- [x] PWA manifest + icons + home-screen install + service worker (static cache)
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
- [x] AI prompt generator — 4 predefined types (skincare, supplements, correlation, weekly)
      with context from profile + routine, editable textarea, copy/regenerate
- [x] AI predefined prompts — save personal override, restore to generated default
- [x] AI custom prompts — create / edit / delete with data block selector
- [x] Vite SPA (replaced Next.js — faster PWA on iOS, no SSR overhead)
- [ ] AI API integration (currently copy-paste only)
- [ ] Stats / charts page
