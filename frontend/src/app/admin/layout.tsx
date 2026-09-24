'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [needsLogin, setNeedsLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  async function checkAdminUser() {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        setNeedsLogin(true);
        setLoading(false);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (profileError || profile?.role !== 'admin') {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      setIsAdmin(true);
    } catch (err) {
      console.error('Auth verification error:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    checkAdminUser();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
      setNeedsLogin(true);
      return;
    }

    await checkAdminUser();
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900 text-white">
        <p className="text-lg animate-pulse">Verifying Admin Credentials...</p>
      </div>
    );
  }

  if (needsLogin || !isAdmin) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-slate-950 text-white p-6">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-xl shadow-xl">
          <h1 className="text-2xl font-bold text-amber-500 mb-2 text-center">Admin Portal Login</h1>
          <p className="text-slate-400 text-sm mb-6 text-center">Enter your administrator credentials to continue.</p>

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-950/50 border border-red-800 text-red-200 text-sm rounded-lg">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-amber-500"
                placeholder="admin@legacygoods.com"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-amber-500"
                placeholder="••••••••"
              />
            </div>
            <button 
              type="submit"
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-black font-semibold rounded-lg transition"
            >
              Sign In as Admin
            </button>
          </form>

          <div className="mt-6 text-center">
            <a href="/Legacy-Goods-Website/" className="text-xs text-slate-400 hover:text-white transition">
              ← Return to Storefront
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100">
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

      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
