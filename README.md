# Continuity — Personal AI Skin & Supplements Checker

Single-user PWA for long-term tracking of skincare, supplements, habits, and daily
observations, with AI-assisted analysis. Linear: [LEN-101](https://linear.app/lenkasilna/issue/LEN-101).

## Stack

- **Next.js 16** (App Router, TypeScript, Tailwind v4, Turbopack)
- **Supabase** — Postgres, magic-link auth, RLS
- **Netlify** — deploy
- **PWA** — `manifest.json` + `display: standalone` → iPhone home screen
- **i18n** — Czech (default) + English, cookie-based locale switcher
- **Email allowlist** — only specific email(s) can sign in (single-user app)

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
   |---|---|
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
2. **Auth → URL Configuration**: add `http://localhost:3000/auth/callback`
   and your production callback URL to **Redirect URLs**.
3. **Auth → Settings**: set JWT expiry to `31536000` (1 year) — permanent login on iPhone.
4. **After your account exists**: **Auth → Providers → Email** → turn **off**
   *“Allow new users to sign up”*. Defense-in-depth alongside the app allowlist.
5. **SQL Editor**: run `supabase/migrations/0001_initial_schema.sql` to create all tables,
   RLS policies, and indexes.

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
  layout.tsx                  ← PWA meta + I18nProvider
  page.tsx                    ← magic-link login (server action)
  globals.css                 ← Tailwind + safe-area + mobile tap targets
  _components/
    locale-switcher.tsx       ← CS/EN toggle
    top-nav.tsx               ← shared header
  _actions/login.ts           ← server action with allowlist check
  auth/
    callback/route.ts         ← OTP exchange + allowlist enforcement
    signout/route.ts          ← sign-out endpoint
  profile/
    page.tsx                  ← About me (name, DOB, gender, skin types)
    _components/profile-form.tsx
    _actions.ts               ← saveProfile upsert
  dashboard/
    page.tsx                  ← overview + roadmap
lib/
  supabase/
    client.ts                 ← createBrowserClient (client components)
    server.ts                 ← createServerClient + cookies (server components)
  i18n/
    messages.ts               ← cs + en dictionary
    server.ts                 ← getLocale / getMessages
    client.tsx                ← I18nProvider + useI18n hook
    actions.ts                ← setLocale (cookie)
  types.ts                    ← DB row types
  skin-types.ts               ← skin type + gender constants
  auth-allowlist.ts           ← ALLOWED_EMAILS parser + check
proxy.ts                      ← Next.js 16 auth proxy, protects /dashboard /profile
supabase/migrations/
  0001_initial_schema.sql     ← profile, products, supplements, habits, routine_items,
                                daily_log, daily_notes + RLS + indexes
public/
  manifest.json               ← PWA config
  icon.svg, icon-192.png, icon-512.png
app/icon.png, app/apple-icon.png, app/favicon.ico  ← favicons (auto-served by Next.js)
```

## Data model (overview)

See `supabase/migrations/0001_initial_schema.sql` for the source of truth.

| Table | Purpose |
|---|---|
| `profile` | 1 row per user — name, DOB, gender, skin_types[] |
| `product_types` | user-managed list of skincare categories (cleanser, serum, …) |
| `products` | skincare library — references `product_types` |
| `supplements` | supplements library |
| `habits` | other care items (teeth brushing, exercise, …) |
| `routine_items` | template: *“this item is done at this slot, this position”* |
| `daily_log` | check-offs: *“on date X I did routine item Y”* |
| `daily_notes` | mood (1–5) + free-form per day |

All tables have RLS — every row references `user_id` with `auth.uid()` default and an
*“own rows”* policy.

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
4. After first deploy, add the production callback URL
   (`https://<your-site>.netlify.app/auth/callback`) to **Supabase Auth → URL Configuration**.

## Status

- [x] Auth (magic link + email allowlist)
- [x] DB schema (8 tables, RLS, indexes)
- [x] Profile setup (About me)
- [x] CS / EN i18n
- [x] Mobile-first styles (safe-area, 44px taps)
- [x] PWA manifest + icons
- [x] Products + product_types library (CRUD, INCI, active ingredients)
- [ ] Supplements library
- [ ] Habits library
- [ ] Routine items (morning / afternoon / evening)
- [ ] Calendar with daily check-offs
- [ ] Daily notes (mood + free text)
- [ ] AI context prompt generator
