import { createClient } from '@supabase/supabase-js';

// Service-role Supabase client for server routes (Storage on the private
// payment-proofs bucket). Never import from client code — the service key
// bypasses RLS entirely.
let cached: ReturnType<typeof createClient> | null = null;

// Canonical name is SUPABASE_SECRET_KEY (see .env.example); the aliases cover
// deploys where the service key was saved under Supabase's older conventions.
function serviceKey() {
  return (
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY
  );
}

/** Whether this deploy can talk to Storage at all (routes fall back to DB-stored screenshots when not). */
export function isStorageConfigured() {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && serviceKey());
}

export function supabaseAdmin() {
  if (cached) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = serviceKey();
  if (!url || !key) throw new Error('NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SECRET_KEY must be set');
  cached = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  return cached;
}

export const PAYMENT_PROOFS_BUCKET = 'payment-proofs';
