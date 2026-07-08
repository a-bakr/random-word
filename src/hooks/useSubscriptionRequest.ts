'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export interface SubscriptionRequestState {
  status: 'pending' | 'approved' | 'rejected' | null;
  plan: string | null;
  createdAt: string | null;
  loading: boolean;
  refresh: () => void;
}

/**
 * Reads the signed-in user's latest manual subscription request (RLS select-own),
 * so the paywall can show the "under review" state after they upload a payment
 * screenshot. Re-fetches when `userId` changes, on window focus, and via
 * `refresh()` right after a submit.
 */
export function useSubscriptionRequest(userId: string | undefined): SubscriptionRequestState {
  const [state, setState] = useState<Omit<SubscriptionRequestState, 'refresh'>>({
    status: null,
    plan: null,
    createdAt: null,
    loading: true,
  });
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick(t => t + 1), []);

  useEffect(() => {
    if (!userId) return;
    let active = true;
    const supabase = createClient();

    const load = async () => {
      const { data } = await supabase
        .from('subscription_requests')
        .select('status, plan, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!active) return;
      setState({
        status: (data?.status as SubscriptionRequestState['status']) ?? null,
        plan: data?.plan ?? null,
        createdAt: data?.created_at ?? null,
        loading: false,
      });
    };

    load();
    const onFocus = () => load();
    window.addEventListener('focus', onFocus);
    return () => {
      active = false;
      window.removeEventListener('focus', onFocus);
    };
  }, [userId, tick]);

  return { ...state, refresh };
}
