import { createClient } from '@supabase/supabase-js';

// Service-role Supabase client for server routes (Storage on the private
// payment-proofs bucket). Never import from client code — SUPABASE_SECRET_KEY
// bypasses RLS entirely.
let cached: ReturnType<typeof createClient> | null = null;

export function supabaseAdmin() {
  if (cached) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error('NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SECRET_KEY must be set');
  cached = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  return cached;
}

export const PAYMENT_PROOFS_BUCKET = 'payment-proofs';
