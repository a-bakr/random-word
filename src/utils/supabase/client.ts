import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

let _client: SupabaseClient | null = null;

/** Browser-side Supabase client (auth/session only), memoized as a singleton. */
export const createClient = (): SupabaseClient => {
  if (_client) return _client;
  _client = createBrowserClient(supabaseUrl, supabaseKey);
  return _client;
};
