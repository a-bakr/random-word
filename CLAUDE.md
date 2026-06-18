# CLAUDE.md

Guidance for AI assistants working in this repository.

## What this is

"Faseeh" is a minimalist, mobile-first **speech & voice-coaching web app**. The
core interaction is tap-anywhere: each tap generates new practice content. It has
three content modes plus voice recording, coaching tips, multi-language support, and a
privacy-light analytics backend with an admin dashboard.

The three content modes (`contentMode` in `src/App.tsx`):

- **words** — random English/Arabic words to practice articulation on.
- **twisters** — tongue twisters with pre-generated TTS audio, shuffled into a
  no-repeat-until-exhausted order.
- **warmup** — a fixed sequence of 20 vocal warm-up exercises (breathing, pitch,
  projection, etc.), each with audio.

On top of any mode the user can hold-to-record their voice; recordings are kept in
memory with a browser transcript (Web Speech API) and can be played back.

## Tech stack

- **Next.js 16** (App Router) + **React 19**, **TypeScript** (`strict: false`).
- **Tailwind CSS v4** via `@tailwindcss/postcss` (no `tailwind.config`; config is
  CSS-first in `src/app/globals.css`).
- **Turbopack** for dev/build (`next.config.ts` sets `turbopack.root`).
- **motion** (Framer Motion successor) for animations.
- **Supabase** — Postgres + Auth. `@supabase/ssr` / `@supabase/supabase-js` handle
  auth/session (anonymous sign-in + optional account upgrade); the `postgres`
  (porsager) driver runs the raw-SQL analytics queries against Supabase Postgres.
- **random-words** — English word generator.
- **lucide-react** — icons.
- Package manager: **pnpm 10.5.2** (`packageManager` field). A `package-lock.json`
  also exists, but pnpm is canonical — prefer `pnpm`.

## Commands

```bash
pnpm install          # install deps
pnpm dev              # next dev on 0.0.0.0:3000
pnpm build            # next build (Turbopack)
pnpm start            # serve production build
pnpm lint             # next lint
pnpm clean            # rm -rf .next
```

There is **no test suite** and no standalone ESLint config file (linting goes through
`next lint`). When you change code, run `pnpm build` to typecheck/catch errors.

## Architecture

### Rendering model

The whole interactive app is **client-only**. `src/app/page.tsx` dynamically imports
`src/App.tsx` with `{ ssr: false }` and wraps it in `LanguageProvider`. Nearly every
file under `src/` that touches state, storage, or the DOM starts with `'use client'`.
Server code lives only in the API route handlers under `src/app/api/`.

### Key files

- `src/App.tsx` — the entire UI orchestrator (~650 lines). Holds all top-level state,
  the tap/swipe/hold/pull gesture handling, mode switching, word history, and renders
  every screen and overlay. Most feature work touches this file.
- `src/app/layout.tsx` — root layout + metadata. `src/app/page.tsx` — entry wrapper.
- `src/app/api/` — server route handlers (see Backend below).
- `src/components/` — presentational components (TopBar, WordItem, TwisterItem,
  WarmupItem, RecordingArea, overlays, settings/about/admin screens, etc.).
- `src/hooks/` — `useLocalStorage` (+ Bool/Str variants), `useVoiceRecognition`,
  `useRecordings`, `useWarmup`, `useTips`, `useLongPress`.
- `src/lib/` — non-React logic: content data, audio players, analytics client, utils.
- `src/contexts/LanguageContext.tsx` — language provider + `useLanguage()` hook.
- `src/types/` — shared types (`WordEntry`, etc.) and `speech.d.ts` (Web Speech API
  typings).
- `src/proxy.ts` — **Next.js middleware** (this Next version names the middleware file
  `proxy.ts` / exports `proxy`). Refreshes the Supabase session on navigations and gates
  `/admin` and `/api/admin/*`: access requires being signed in as the admin email
  (`isAdminEmail` in `src/lib/admin.ts`, default `abab231196@gmail.com`, override with
  `NEXT_PUBLIC_ADMIN_EMAIL`). Non-admins get 403 (API) or a redirect to `/` (page).

Path alias: `@/*` → `src/*` (see `tsconfig.json`). Within `src/App.tsx` and siblings,
relative imports (`./lib/...`, `./components/...`) are also used.

### Multi-language system (registry pattern)

Languages self-register via **side-effect imports**. To add a language:

1. Create `src/lib/languages/xx.ts` and call `registerLanguage({...})` at module load
   (see `src/lib/languages/registry.ts` for the `LanguageConfig` shape: code, name,
   direction, `speechRecognitionCode`, `labels`, `generateWord()`, and optional
   `twisters` / `warmupExercises` / `tips`).
2. Add the side-effect `import '../lib/languages/xx';` in
   `src/contexts/LanguageContext.tsx`.
3. Add the code to the `LanguageCode` union in `registry.ts`.

Currently registered: `en` (`en.ts`) and `ar` (`ar.ts`). When a language omits
`twisters`/`warmupExercises`/`tips`, the app falls back to the English content. The
active language persists in `localStorage` under `language`. Document direction
(`dir`/`lang`) is set from the active config in `App.tsx`.

### Content & audio

- Tongue twisters: `src/lib/twisters.ts` (English data) — `{ id, text, sound,
  difficulty }`. Arabic equivalents live in the language config.
- Warm-ups: `src/lib/warmup.ts` — `WARMUP_EXERCISES` (`w001`–`w020`).
- Coaching tips: `src/lib/tips.ts`, surfaced via `useTips`. Conceptual source material
  is `docs/stage-academy.md` (Vinh Giang's STAGE Academy).
- Audio playback uses a small factory `createAudioPlayer(basePath)` in
  `src/lib/audio.ts`, wrapped by `src/lib/twisterAudio.ts` and
  `src/lib/warmupAudio.ts` (each exposes `play`/`stop`/`subscribe`). UI sound effects
  (pop) are in `src/lib/sounds.ts`.
- Audio assets are **pre-generated WAVs** committed under `public/twisters/NNN.wav` and
  `public/warmup/wNNN.wav`, keyed by the content `id`.

### State & persistence

User preferences and last-shown content persist to `localStorage` through the typed
hooks in `src/hooks/useLocalStorage.ts` (keys like `maxWords`, `fontSize`,
`timerDuration`, `timerEnabled`, `twisterMode`, `warmupMode`, `centeredWord`,
`language`, `lastTwisterId`, `lastWordText`, `twisterOrder_<lang>`, `isAdmin`). Word
history (for back navigation) is kept in refs in `App.tsx`, capped at 20 entries.

## Backend & analytics

A first-party analytics pipeline (no third-party tracker), built on Supabase:

0. **Identity** — `src/hooks/useSupabaseUser.ts` establishes a Supabase auth session for
   every visitor: it **signs in anonymously** on first load (zero-friction, no UI), so the
   analytics `user_id` is a real `auth.users` uuid. Visitors can later **upgrade in place**
   to a permanent account (email confirmation or Google) via the Account section in
   Settings (`SettingsScreen` → `AccountSection`); the `auth.uid()` is preserved so history
   carries over. `src/proxy.ts` refreshes the session cookie on navigations.
1. **Client** — `src/lib/track.ts` exposes `track(name, props)` and `setTrackContext({
   userId, language })`. The auth hook feeds it the current `user_id`; `App.tsx` feeds the
   active `language`. It keeps a per-tab `session_id` (sessionStorage), attaches UTM +
   referrer, and `POST`s to `/api/track` with `keepalive`. Existing event names:
   `pageview`, `session_start`, `session_end`, `word_generated`, `twister_generated`,
   `mode_changed`, `recording_started`, `recording_stopped`, `setting_changed`, etc.
   `word_generated`/`twister_generated` carry `{ mode, language }` props.
2. **Ingest** — `src/app/api/track/route.ts` (`runtime = 'nodejs'`) parses the
   user-agent and Vercel geo headers, then writes to the `events` table (incl. `language`,
   `user_id::uuid`) and upserts the `sessions` rollup.
3. **Aggregate** — `src/app/api/cron/aggregate/route.ts` rolls yesterday's events into
   `daily_stats` (distinct users + per-mode / per-language word rollups). Triggered by the
   Vercel cron in `vercel.json` (`10 0 * * *`), guarded by `Authorization: Bearer ${CRON_SECRET}`.
4. **Admin dashboard** — `/admin` page (`src/app/admin/page.tsx` + `AdminScreen.tsx`) is a
   tabbed monitoring UI (overview / users / funnels / acquisition) reading
   `/api/admin/{summary,timeseries,feed,users,users/[id],funnels}`. All `/admin` and
   `/api/admin/*` routes are gated in `src/proxy.ts` by the admin email (Supabase Auth /
   Google sign-in — no password). The dashboard sign-in uses `signInWithOAuth`.

### Database

Supabase Postgres. Raw-SQL analytics queries use the `postgres` (porsager) driver via
`src/lib/db.ts` (`export const sql = postgres(SUPABASE_DB_URL, { prepare: false, ssl:
'require' })`); throws at import if `SUPABASE_DB_URL` is unset. It connects as the
`postgres` owner, which **bypasses RLS** for ingest/admin queries. Tables: `profiles`
(1:1 with `auth.users`, auto-created by a `handle_new_user` trigger), `events`,
`sessions`, `daily_stats`; RLS is enabled on all (analytics tables have no client-facing
policies). Schema lives in **Supabase CLI migrations** under `supabase/migrations/` — apply
with `supabase db push` (or paste into the dashboard SQL editor). Add a new migration with
`supabase migration new <name>` rather than editing existing files. **Anonymous sign-ins
must be enabled** in the Supabase dashboard (Authentication → Providers), and Google OAuth
configured if used.

## Environment variables

See `.env.example`. The variables the code expects:

- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — Supabase client (auth).
- `SUPABASE_DB_URL` — Postgres connection string for `src/lib/db.ts` (direct for dev; the
  Supavisor **transaction pooler** URL, port 6543 `?pgbouncer=true`, for Vercel/prod).
- `SUPABASE_SECRET_KEY` — service/secret key (server-side supabase-js / admin-role checks).
- `CRON_SECRET` — bearer token for the aggregate cron.
- `NEXT_PUBLIC_ADMIN_EMAIL` — email granted admin access (Supabase Auth / Google).
  Optional; defaults to the owner email in `src/lib/admin.ts`.
- `GEMINI_API_KEY` or `GEMINI_API_KEYS` (comma-separated) — only for the local audio
  generation scripts, not the app runtime.

Secrets are gitignored (`.env*` except `.env.example`).

## Audio generation scripts

`scripts/` contains Node ESM scripts that synthesize the committed WAVs with Gemini
Flash TTS (run manually, not part of build):

- `generate-audio.mjs` — English twisters → `public/twisters/`.
- `generate-warmup-audio.mjs` — warm-ups → `public/warmup/`.
- `generate-arabic-twisters-audio.mjs`, `generate-arabic-warmup-audio.mjs` — Arabic.
- `test-tts.js` — single-file smoke test.

Typical use: `GEMINI_API_KEY=... node scripts/generate-audio.mjs [--only NNN] [--force]`.
They parse content directly out of the `.ts` data files and handle key rotation /
429 backoff. **If you add or change twister/warm-up text, regenerate the matching audio**
(or note that audio is stale).

## Deployment

Hosted on **Vercel** (`vercel.json`, `framework: nextjs`). The only piece beyond a
standard Next deploy is the cron entry hitting `/api/cron/aggregate`. API routes that
touch the DB pin `runtime = 'nodejs'`.

## Conventions & gotchas

- Default to `'use client'` for anything under `src/` outside `app/api/`.
- Persist user-facing preferences with the `useLocalStorage*` hooks, and emit a
  `track('setting_changed', { key, value })` when a setting changes (match existing
  patterns in `App.tsx`).
- Keep gesture logic (tap/swipe/hold-to-record/pull-to-refresh) in `App.tsx`'s pointer
  handlers; they share refs and a `holdFiredRef` guard to avoid double-firing.
- Any new user-visible string must be added to **every** language's `labels` block in
  `src/lib/languages/*.ts` (the `LanguageLabels` interface in `registry.ts` enforces
  the shape) — don't hardcode copy in components.
- New analytics columns require a new `supabase migration new <name>` migration (under
  `supabase/migrations/`, applied via `supabase db push`) plus updates to the insert in
  `api/track/route.ts` (and any reader in `api/admin/*`).
- `src/lib/db.ts` uses the `postgres` (porsager) driver: pass JS objects to `jsonb`
  columns with an explicit `::jsonb` cast, and uuids with `::uuid`. `await sql\`...\``
  returns an array of row objects (supports `.map` / `[0]`), like the old Neon client.
- TypeScript is non-strict; still prefer typed code and run `pnpm build` to verify.

## Git / workflow

- Do **not** create pull requests unless explicitly asked.
- Develop on the designated feature branch; commit with clear messages; push with
  `git push -u origin <branch>`.
