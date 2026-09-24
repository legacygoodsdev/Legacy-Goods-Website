'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function Header() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    async function checkUserRole() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      setUserEmail(session.user.email ?? null);

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (profile?.role === 'admin') {
        setIsAdmin(true);
      }
    }

    checkUserRole();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        setUserEmail(session.user.email ?? null);
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        setIsAdmin(profile?.role === 'admin');
      } else {
        setUserEmail(null);
        setIsAdmin(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur px-8 py-4 flex justify-between items-center">
      <Link href="/" className="text-xl font-bold tracking-wider text-amber-500">
        LEGACY GOODS
      </Link>
      
      <div className="flex items-center gap-4">
        {isAdmin && (
          <Link 
            href="/admin" 
            className="text-xs uppercase tracking-wider px-4 py-2 bg-amber-600/20 border border-amber-600/50 hover:bg-amber-600/30 text-amber-400 rounded-lg font-medium transition"
          >
            🛡️ Admin Panel
          </Link>
        )}
        {userEmail ? (
          <span className="text-xs text-slate-400">Signed in as {userEmail}</span>
        ) : (
          <Link 
            href="/login" 
            className="text-xs uppercase tracking-wider px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition"
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
}
