// Freemium model configuration and tier resolution.
//
// Tiers:
//   - trial:   first TRIAL_DAYS after the (anonymous) signup date — unlimited.
//   - premium: an active subscription — unlimited.
//   - free:    trial over, no subscription — capped per local-calendar day by FREE_LIMITS.
//
// The actual payment integration (Paymob / Paddle) is layered on top: it only needs
// to flip `isPremium` true. Everything else here is provider-agnostic.

// Master switch for the whole freemium/subscription layer. Kept OFF until the
// payment methods (Paymob etc.) are wired up. While off, the app is fully
// unlimited for everyone: no paywall is ever shown, daily quotas aren't
// enforced, and the plan/upgrade UI is hidden. Flip back to `true` to re-enable
// gating once checkout works end-to-end.
export const BILLING_ENABLED = false;

export type Tier = 'trial' | 'free' | 'premium';

/** What the free tier may generate per local-calendar day. */
export type Quota = 'words' | 'twisters' | 'warmups';

export const TRIAL_DAYS = 7;

export const FREE_LIMITS: Record<Quota, number> = {
  words: 5,
  twisters: 1,
  warmups: 1,
};

// Subscription plans. `amount` is in piasters (EGP × 100), the unit Paymob expects.
export const PLANS = {
  monthly: { amount: 3000, months: 1, label: 'monthly' },
  yearly: { amount: 29900, months: 12, label: 'yearly' },
} as const;

export type PlanId = keyof typeof PLANS;

export function isPlanId(v: unknown): v is PlanId {
  return v === 'monthly' || v === 'yearly';
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** Local-calendar day key (resets at the user's midnight). */
export function todayKey(now = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Whole days remaining in the trial (0 once expired). `createdAt` is the signup date. */
export function trialDaysLeft(createdAt: string | undefined, now = Date.now()): number {
  if (!createdAt) return TRIAL_DAYS; // unknown yet (auth still loading) — stay permissive
  const start = new Date(createdAt).getTime();
  if (Number.isNaN(start)) return TRIAL_DAYS;
  const end = start + TRIAL_DAYS * DAY_MS;
  return Math.max(0, Math.ceil((end - now) / DAY_MS));
}

export function resolveTier(createdAt: string | undefined, isPremium: boolean, now = Date.now()): Tier {
  if (isPremium) return 'premium';
  if (trialDaysLeft(createdAt, now) > 0) return 'trial';
  return 'free';
}
