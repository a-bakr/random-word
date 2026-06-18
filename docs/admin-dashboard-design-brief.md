# Admin Dashboard — UI/UX Design Brief

> **Handoff to the UI/UX team.** This document describes *what* the admin
> dashboard needs to do and *what data* it has. The look, layout, interaction
> design, and visual system are **yours to own**. Everything below about styling
> is the current state for context only — feel free to replace it entirely.

---

## 1. Product context

**Faseeh** (internal name "Random Word") is a minimalist, mobile-first speech &
voice-coaching web app. Users tap anywhere to generate practice content (random
words, tongue twisters, or vocal warm-ups) and can hold-to-record their voice.

This dashboard is the **owner/admin analytics console** — a private, single-user
monitoring tool (gated to one admin email via Google sign-in). It is **not** a
customer-facing screen. The audience is the founder watching product health:
who's showing up, what they do, where they come from, and whether they convert
from "just visited" to "actually practiced" to "recorded their voice."

### Design goals

- **Minimalistic, clean, informative.** Calm, low-chrome, data-first.
- **Charts where charts help** — trends over time, distributions, funnels.
- **Scannable at a glance**, with the ability to drill into a single user.
- **Mobile-friendly** (the whole product is mobile-first; the admin opens it on
  a phone too), but desktop is the primary working surface.
- Light + dark mode.

You have **full creative ownership** of the visual design, component system,
chart library choice, information hierarchy, and layout. Treat the sections
below as the *data contract* and *feature requirements*, not a layout spec.

---

## 2. Global structure

- **Time-window selector**, applies to the whole dashboard: `24h`, `7d`, `30d`.
- **Four sections** (currently flat tabs — reorganize however reads best):
  1. **Overview** — live pulse + headline numbers + activity.
  2. **Users** — who they are, list + per-user drill-down.
  3. **Funnels** — conversion + usage breakdowns.
  4. **Acquisition** — where traffic comes from.
- **Auto-refresh**: data re-fetches every 30s. A live/"now" indicator matters.
- **Auth gate**: signed-out state shows a single "Sign in with Google" button.

---

## 3. Sections, data & required information

Each block below lists the metrics available. Field names map 1:1 to existing
API responses (so engineering can wire any design back to real data).

### 3.1 Overview

**Headline stats (3 KPIs):**
| Metric | Meaning |
|---|---|
| `now` | active users right now (live) |
| `today` | sessions today |
| `period` | sessions over selected window |

**Time series** (`timeseries` endpoint) — array of buckets, each with:
`{ bucket, sessions, words, recordings }`. Currently only `sessions` is charted
as bars. **Opportunity:** this is the main trend chart — words & recordings are
available too (multi-series line/area, toggles, etc.).

**Activity list** — event counts over the window: `{ name, n }`.
Event names: `pageview`, `session_start`, `word_generated`, `twister_generated`,
`recording_started`, `recording_stopped`, `mode_changed`, `setting_changed`, …

**Geography & referrers** — `countries[]` and `referrers[]` (each `{ label, n }`).

**Recent feed** — live stream of latest events:
`{ name, country, device, browser, ts }`.

### 3.2 Users

**Totals (KPIs):** `total`, `registered`, `anonymous`, `new_today`, `returning`.

> Note: every visitor is signed in anonymously on first load; some later upgrade
> to a real account. So "registered vs anonymous" is a meaningful split, and a
> green dot currently marks registered users.

**User list** — one row per user:
`{ user_id, is_anonymous, email, sessions, words, recordings, returning,
first_seen, last_seen }`. Rows are clickable → drill-down.

**User detail (drill-down):**
- Profile: email / anonymous, full user id.
- Session history: `{ country, device, language, started_at }`.
- Recent events: `{ name, ts, language }`.

### 3.3 Funnels

**Conversion funnel (3 steps):** `visited → practiced → recorded`
(`{ visited, practiced, recorded }`), shown with absolute counts + % of top.

**Breakdowns:**
- `by_mode[]` — words / twisters / warmup usage `{ mode, n }`.
- `by_language[]` — `{ language, n }` (currently `en`, `ar`).

**Engagement:** `avg_events_per_session` (single number).

### 3.4 Acquisition

All are ranked distributions (`{ label, n }`), currently rendered as horizontal
bar lists:
- `referrers` — where they came from (or "direct").
- `utm_sources` — campaign sources.
- `countries`
- `devices` — mobile / desktop / tablet.
- `browsers`
- `oses`

---

## 4. Chart & component inventory (what's needed)

You decide the chart types and library. For reference, the data naturally calls
for:

- **Trend over time** (sessions / words / recordings) — line/area/bar.
- **Funnel** — 3-step conversion.
- **Ranked distributions** (countries, referrers, devices, browsers, os, utm,
  by-mode, by-language) — bar lists, treemaps, or donuts.
- **KPI stat tiles** — big number + label + optional sparkline/delta.
- **Live feed** — streaming list with relative timestamps.
- **Data table** — the user list, sortable, with drill-down.
- **Empty / loading / signed-out** states for every block.

Formatting conventions already in use (keep or change): big numbers abbreviated
(`1.2k`, `3.4m`), timestamps shown relative (`5m`, `2h`, `3d`).

---

## 5. Current implementation (context only — replaceable)

The existing dashboard is deliberately austere: monochrome **zinc** palette,
**monospace** labels, hairline dividers, 1px bar charts, no chart library, capped
to a narrow centered column (`max-w-xl`). It's intentionally plain and is the
thing we're asking you to elevate.

- Single file: `src/components/AdminScreen.tsx` (presentational).
- Route: `/admin` (`src/app/admin/page.tsx`), gated in `src/proxy.ts`.
- Data endpoints (already built, stable contracts):
  `/api/admin/summary`, `/timeseries`, `/feed`, `/users`, `/users/[id]`,
  `/funnels` — all accept `?window=24h|7d|30d`.
- Stack you're designing within: **Next.js 16 / React 19 / Tailwind CSS v4**
  (CSS-first config in `src/app/globals.css`), `motion` for animation,
  `lucide-react` for icons. A chart library is **not** yet in the project — pick
  one (Recharts, visx, etc.) and we'll add it.

### What we'd love from you
1. A visual design / mockups for all four sections (light + dark, mobile +
   desktop).
2. A small **design system**: type scale, color tokens, spacing, chart styles,
   stat-tile / card / table / chip components.
3. Recommended chart library + chart specs.
4. Interaction notes: window switching, auto-refresh affordance, drill-down
   navigation, empty/loading states.

Deliver in whatever format suits you (Figma, etc.). Data shapes above are fixed
contracts; layout and visuals are entirely yours.
