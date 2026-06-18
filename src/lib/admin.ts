/**
 * Admin access is granted to whoever is signed in (via Supabase Auth / Google)
 * with this email. Override with NEXT_PUBLIC_ADMIN_EMAIL; defaults to the owner.
 * NEXT_PUBLIC_ is readable both client-side (to render the dashboard) and
 * server-side (to enforce it in middleware / API routes).
 */
export const ADMIN_EMAIL = (
  process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'abab231196@gmail.com'
).toLowerCase();

export function isAdminEmail(email?: string | null): boolean {
  return !!email && email.toLowerCase() === ADMIN_EMAIL;
}
