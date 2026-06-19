# Faseeh — UI/UX Handoff

A reference for the design team to review and redesign the app. This documents
**what exists today**, screen by screen, so you can propose enhancements. The app
is heading toward public launch as a **subscription product**, so the redesign
should account for onboarding, paywall/upsell surfaces, and a polished first-run
experience — none of which exist yet.

> Attach a screenshot for each screen/section below as you review. Placeholders are
> marked `📷 [screenshot]`.

---

## 1. What Faseeh is

A minimalist, **mobile-first speech & voice-coaching web app**. The core interaction
is **tap-anywhere**: every tap on the screen generates new practice content. There is
essentially **one screen** — the practice canvas — with content modes and overlays
layered on top, plus two full-screen panels (Settings, About).

Three content modes:
- **Words** — random words to practice articulation on (English / Arabic).
- **Twisters** — tongue twisters with pre-generated TTS audio.
- **Warm-up** — a fixed 20-step vocal warm-up sequence (breathing, pitch, projection…).

On top of any mode, the user can **hold to record** their voice, get a live transcript,
and play recordings back. Optional **coaching tips** float near the content.

**Target:** mobile web first (portrait phone), works on desktop. RTL-aware (Arabic).

---

## 2. Current design language

This is the existing visual system. The redesign can keep, evolve, or replace it —
but it's the baseline.

- **Aesthetic:** ultra-minimal, "quiet" / zen. Lots of negative space, no chrome, no
  cards or borders on the main canvas. Content floats on a near-blank background.
- **Color:** monochrome `zinc` grayscale palette. Light mode `zinc-50` bg / dark mode
  `zinc-950` bg. Accent color appears only on **generated words** (each word gets a
  random color) and on category tags (warm-up categories, coaching tips).
- **Type:** system default sans. Large, tight tracking, `font-medium`/`font-black` for
  hero content. Practice words scale **16–160px** (user-adjustable). Mono font for
  meta/labels (warm-up category, progress counter, tip labels).
- **Iconography:** `lucide-react`, 20px, `strokeWidth 2.5`, thin and consistent.
- **Signature texture:** a global SVG **"sketch" filter** (`feTurbulence` +
  `feDisplacementMap`) applied to most icons and buttons, giving edges a subtle
  hand-drawn wobble. This is a deliberate brand quirk.
- **Motion:** `motion` (Framer Motion). Content enters/exits with **blur + scale +
  opacity** transitions (~0.7s, custom easing `[0.16,1,0.3,1]`). Everything fades and
  blurs rather than sliding hard.
- **Theme transition:** 700ms color crossfade between light/dark.
- **Dark/light:** full support, auto-detected from OS, manually togglable.

---

## 3. Screen-by-screen breakdown

### 3.1 Practice canvas — Words mode (default / home)

📷 [screenshot: words mode, light + dark]

The default landing state. Full-screen tappable canvas.

**On first load (empty state):** a faint centered hint reads **"tap me"** (low-contrast
gray, same large font as words).

**After tapping:** a random word appears — large, colored, by default at the tap
location (or dead-center if "centered" is enabled). Each tap generates a new word.

Persistent UI on this screen:
- **Top bar (center-top):** 6 icon buttons in a row — Words, Twisters, Warm-up,
  Settings, About, Language. Active mode is highlighted with a subtle filled pill.
  Icons stay LTR-positioned even in Arabic.
- **Font-size control (bottom-center):** two buttons, small `a` / large `A`, to shrink/grow
  the word (16–160px).
- **Record button (bottom-left):** mic icon. Tap or hold-anywhere to record. Recorded
  clips stack above it as small rows (play ▸ / 3-word transcript / ✕ remove).
- **Timer (bottom-right):** a clock toggle + countdown timer (default 60s) that starts
  on the first tap and resets each tap. Used as a practice pacer.
- **Coaching tips (optional):** 0–3 small dashed-border "pill" tags floating around the
  word (e.g. a vocal/framework/archetype tip). Tapping one opens the Tip overlay.

**Gestures (shared across modes):**
- Tap → next word
- Swipe right → next / swipe left → previous (word history, up to 20 back)
- Hold (300ms) → start recording, release → stop
- Pull down from top → reload/refresh

### 3.2 Practice canvas — Twisters mode

📷 [screenshot: twisters mode]

Same canvas, but content is a **tongue twister** (a full sentence, centered, wraps to a
few lines). Pre-generated TTS audio **auto-plays** when a new twister appears.

- Tap **right half** of screen → next twister; tap **left half** → previous.
- Twisters are shuffled into a no-repeat-until-exhausted order.
- **Replay/stop audio** button appears bottom-right (above the timer).
- Recording, font-size, timer, tips all still available.

### 3.3 Practice canvas — Warm-up mode

📷 [screenshot: warmup mode]

A guided, **fixed 20-step sequence**. Different layout from words/twisters — it's a
centered, structured "exercise card" (no card chrome, but vertically composed):

1. A hand-drawn **SVG figure** illustrating the exercise (unique per step, sketch-filtered).
2. A **category tag** (pill, color-coded): Breathing (sky), Physical (orange),
   Resonance (violet), Articulation (emerald), Pitch (amber), Projection (rose).
3. Large **exercise title**.
4. **Instruction** paragraph.
5. Optional **example** line (mono).
6. **Play/Stop audio** button (guided audio for the exercise).
7. First-visit hint: "tap to continue".

- **Progress indicator (bottom-center):** `3 of 20`, with milestone flavor text
  (`· halfway`, `· final stretch`, `· going again`) and a **reset** ↺ button.
- Tap right → next step, tap left → previous step.
- No font-size / timer / record controls in this mode (they're hidden).

### 3.4 Recording & transcript

📷 [screenshot: recording active + a saved clip + transcript card]

- **Active recording:** the mic button turns into a stop square with a pulsing red ring.
- **Live transcript** (Web Speech API) appears as faint centered text near the bottom
  while recording; tap to dismiss.
- **Saved clips:** stack bottom-left, each row = play/stop + truncated 3-word transcript
  + remove. Tapping the transcript text opens the **Transcript card** — a small
  bottom-sheet (mobile) / bottom-right panel (desktop) showing the full transcript
  (or "no transcript" italic).
- Recordings are **in-memory only** (lost on reload) — a candidate for the subscription
  feature set (persistent recordings, history, etc.).

### 3.5 Coaching tip overlay

📷 [screenshot: tip overlay]

Tapping a floating tip pill opens a full-screen, editorial-style overlay:
- Small uppercase category label (Vocal / Framework / Archetype).
- Huge title (clamp 48–88px).
- Hand-drawn wavy divider line (animated draw-in).
- Description paragraph + italic instruction.
- Two actions: **"tap to dismiss"** and **"try now"** (try now closes the tip and starts
  a recording). Content sourced from Vinh Giang's STAGE Academy material.

### 3.6 Settings panel

📷 [screenshot: settings, top + scrolled to account]

Full-screen scrollable panel (max-width ~512px, centered). Header: small uppercase
"preferences" eyebrow + large "Settings" title. Rows separated by hairline dividers,
each a label + a pill button on the right:

- **Theme** — Light / Dark toggle (sun/moon icon).
- **Sound effects** — On / Off.
- **Words on screen** — cycles 1 / 2 / 3 / 5 / ∞.
- **Word display** — Centered / Random.
- **Coaching tips** — cycles Off / 1 / 2 / 3.
- **Account section:**
  - Signed out: "Sign in to sync your progress" + **Continue with Google** button.
  - Signed in: "Signed in as {email}" + Sign out.
  - (Today every visitor is silently signed in **anonymously**; this upgrades in place.)
- **Admin** row — only visible to the admin account (dashboard link).

### 3.7 About panel

📷 [screenshot: about]

Full-screen scrollable panel, same layout grammar as Settings. Creator bio:
- Circular avatar.
- "created by" eyebrow + name (huge).
- Subtitle (role/location).
- Hand-drawn wavy divider.
- App name, tagline, description (mentions STAGE Academy inspiration), creator bio.
- Links: website / linkedin / github.

### 3.8 Language switching

The language icon in the top bar **cycles** through registered languages (currently
English ↔ Arabic). Switching flips the whole document to **RTL** for Arabic and
regenerates the current content in the new language. All copy is centralized per
language (no hardcoded strings) — the redesign must keep every user-facing string
translatable and must look correct in **both LTR and RTL**.

### 3.9 Admin dashboard (internal — lower priority for redesign)

📷 [screenshot: admin (optional)]

A separate `/admin` route: a tabbed analytics dashboard (overview / users / funnels /
acquisition) with line charts and sparklines. Internal tool, gated to the owner. Has
its own design brief (`docs/admin-dashboard-design-brief.md`). **Not part of the
consumer redesign** unless we decide to refresh it too.

---

## 4. What's missing today (opportunities for the redesign)

These don't exist yet and are the most valuable design work for launch:

- **Onboarding / first-run** — there's no tutorial; the only guidance is the "tap me"
  hint and the gestures are undiscoverable (swipe, hold-to-record, pull-to-refresh).
  Gesture discoverability is a known weak point.
- **Subscription / paywall surfaces** — pricing screen, upgrade prompts, "premium"
  feature gating, account/billing management. The product is going subscription-based;
  none of this UI exists.
- **Account & history** — recordings are memory-only; a signed-in experience with saved
  history, progress tracking, and streaks is implied by the "sync your progress" copy
  but not built.
- **Landing / marketing page** — there is no pre-app landing page; the app loads
  straight into the canvas.
- **Empty/loading/error states** — minimal today.
- **Mode discoverability** — the difference between Words/Twisters/Warm-up isn't
  explained anywhere in-app.

---

## 5. Constraints & non-negotiables for the redesign

- **Mobile-first, portrait.** Must work one-handed. Desktop is secondary but supported.
- **Tap-anywhere stays central.** The whole-screen-is-a-button interaction is the soul
  of the product; controls must not crowd out the tap surface.
- **Bilingual + RTL.** Every layout must mirror correctly for Arabic. No hardcoded copy.
- **Light & dark** must both be designed.
- **Keep it calm.** The current minimal/zen tone is intentional; any richer UI
  (paywall, onboarding) should still feel quiet and uncluttered.
- **Accessibility:** large tap targets, legibility at the 16–160px word range, and the
  sketch-filter texture should not hurt contrast/readability.

---

## 6. Tech context (for feasibility, not prescriptive)

- Next.js (App Router) + React + TypeScript, Tailwind CSS v4, `motion` for animation,
  `lucide-react` icons. The whole interactive app is client-rendered.
- Components live in `src/components/`; the orchestration screen is `src/App.tsx`.
- Designs delivered as Figma + redlines are ideal; the team can implement in Tailwind.

---

*Drop screenshots under each `📷` marker (or attach separately keyed to the section
numbers) and add redesign notes inline.*
