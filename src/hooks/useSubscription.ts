'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

interface SubscriptionState {
  isPremium: boolean;
  plan: string | null;
  currentPeriodEnd: string | null;
  loading: boolean;
}

/**
 * Reads the signed-in user's own subscription row (RLS select-own) and derives
 * whether they're currently premium. Re-fetches when `userId` changes (e.g. after
 * anonymous sign-in resolves) and on window focus (to pick up a just-completed
 * checkout when the user is redirected back).
 */
export function useSubscription(userId: string | undefined): SubscriptionState {
  const [state, setState] = useState<SubscriptionState>({
    isPremium: false,
    plan: null,
    currentPeriodEnd: null,
    loading: true,
  });

  useEffect(() => {
    if (!userId) return;
    let active = true;
    const supabase = createClient();

    const load = async () => {
      const { data } = await supabase
        .from('subscriptions')
        .select('plan, status, current_period_end')
        .eq('user_id', userId)
        .maybeSingle();
      if (!active) return;
      const end = data?.current_period_end ?? null;
      const isPremium = data?.status === 'active' && !!end && new Date(end) > new Date();
      setState({ isPremium, plan: data?.plan ?? null, currentPeriodEnd: end, loading: false });
    };

    load();
    const onFocus = () => load();
    window.addEventListener('focus', onFocus);
    return () => {
      active = false;
      window.removeEventListener('focus', onFocus);
    };
  }, [userId]);

  return state;
}
