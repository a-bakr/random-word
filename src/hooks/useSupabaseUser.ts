'use client';

import { useCallback, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';
import { setTrackContext } from '@/lib/track';

/**
 * Establishes a Supabase auth session for every visitor.
 *
 * On first load with no session, signs in anonymously (zero-friction — no UI).
 * The resulting auth user id becomes the analytics `user_id` (via track context).
 * Visitors can later upgrade the anonymous user in place to a permanent account
 * (email confirmation or Google) without losing their history.
 */
export function useSupabaseUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (active && !data.session) {
        await supabase.auth.signInAnonymously();
      }
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      const u = session?.user ?? null;
      setUser(u);
      setTrackContext({ userId: u?.id ?? null });
      setLoading(false);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const isAnonymous = !!user?.is_anonymous;
  const isRegistered = !!user && !user.is_anonymous;

  /** Upgrade the (anonymous) user to a permanent account via email confirmation. */
  const linkEmail = useCallback(async (email: string) => {
    const supabase = createClient();
    return supabase.auth.updateUser({ email });
  }, []);

  /** Upgrade/link the user via Google OAuth. */
  const linkGoogle = useCallback(async () => {
    const supabase = createClient();
    return supabase.auth.linkIdentity({
      provider: 'google',
      options: {
        redirectTo:
          typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined,
      },
    });
  }, []);

  /** Sign in with Google directly (used for admin access; replaces the session). */
  const signInGoogle = useCallback(async () => {
    const supabase = createClient();
    return supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo:
          typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined,
      },
    });
  }, []);

  const signOut = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    // Re-establish an anonymous session so tracking continues.
    await supabase.auth.signInAnonymously();
  }, []);

  return { user, loading, isAnonymous, isRegistered, linkEmail, linkGoogle, signInGoogle, signOut };
}
