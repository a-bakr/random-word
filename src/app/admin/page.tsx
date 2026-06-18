'use client';

import { useEffect, useState } from 'react';
import { Geist, Geist_Mono } from 'next/font/google';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';
import { isAdminEmail } from '@/lib/admin';
import { Dashboard } from '@/components/admin/Dashboard';

const geist = Geist({ subsets: ['latin'], variable: '--font-geist', weight: ['400', '500', '600'] });
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono', weight: ['400', '500'] });

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // The main app hides body overflow (single-screen tap UI); the dashboard scrolls.
  useEffect(() => {
    const { overflow, height } = document.body.style;
    document.body.style.overflow = 'auto';
    document.body.style.height = 'auto';
    return () => {
      document.body.style.overflow = overflow;
      document.body.style.height = height;
    };
  }, []);

  const signIn = () => {
    createClient().auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/admin` },
    });
  };
  const signOut = async () => {
    await createClient().auth.signOut();
    setUser(null);
  };

  const cls = `${geist.variable} ${geistMono.variable}`;

  // Avoid flashing the sign-in screen to an admin before the session resolves.
  if (!ready) {
    return <div className={cls} style={{ minHeight: '100vh', background: '#09090b' }} />;
  }

  return (
    <div className={cls} style={{ minHeight: '100vh' }}>
      <Dashboard
        isAdmin={isAdminEmail(user?.email)}
        signIn={signIn}
        signOut={signOut}
        sansVar="var(--font-geist)"
        monoVar="var(--font-geist-mono)"
      />
    </div>
  );
}
