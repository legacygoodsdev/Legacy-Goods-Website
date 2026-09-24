'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkAdminUser() {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        // Redirect to login if not authenticated
        router.push('/');
        return;
      }

      // Check if user has admin role in profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (profile?.role === 'admin') {
        setIsAdmin(true);
      } else {
        alert('Access denied. Administrator privileges required.');
        router.push('/');
      }
      setLoading(false);
    }

    checkAdminUser();
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900 text-white">
        <p className="text-lg animate-pulse">Verifying Admin Credentials...</p>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 bg-slate-950 p-6 flex flex-col justify-between">
        <div>
          <div className="text-xl font-bold tracking-wider text-amber-500 mb-8">
            LEGACY GOODS <span className="text-xs text-slate-400 block font-normal">Admin Suite</span>
          </div>

          <nav className="space-y-2">
            <Link href="/admin" className="block px-4 py-2.5 rounded-lg hover:bg-slate-800 transition">
              📊 Overview
            </Link>
            <Link href="/admin/products" className="block px-4 py-2.5 rounded-lg hover:bg-slate-800 transition">
              📦 Products & Stock
            </Link>
            <Link href="/admin/orders" className="block px-4 py-2.5 rounded-lg hover:bg-slate-800 transition">
              🛒 Orders
            </Link>
          </nav>
        </div>

        <div className="text-xs text-slate-500 border-t border-slate-800 pt-4">
          Logged in as System Admin
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}