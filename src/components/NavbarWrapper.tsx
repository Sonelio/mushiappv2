'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Navbar from './Navbar';

export default function NavbarWrapper({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<boolean>(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(!!session);
    };

    // Check initial session
    checkSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(!!session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  return (
    <>
      {session && <Navbar />}
      <main className={session ? "pt-24" : ""}>
        {children}
      </main>
    </>
  );
} 