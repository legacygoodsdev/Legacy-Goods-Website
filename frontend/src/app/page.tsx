'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Storefront() {
  const router = useRouter();

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const p = query.get('p');
    if (p) {
      router.replace(p);
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      {/* Store Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur px-8 py-4 flex justify-between items-center">
        <div className="text-xl font-bold tracking-wider text-amber-500">
          LEGACY GOODS
        </div>
        <div className="space-x-4">
          <Link 
            href="/admin" 
            className="text-xs uppercase tracking-wider px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition"
          >
            Admin Panel
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center p-12 text-center">
        <h1 className="text-5xl font-extrabold tracking-tight text-white mb-4">
          Timeless Craftsmanship. <span className="text-amber-500">Modern Standard.</span>
        </h1>
        <p className="text-slate-400 max-w-xl mb-8 text-lg">
          Welcome to Legacy Goods. Explore our curated catalog of industrial-grade products built to last.
        </p>
        <div className="flex gap-4">
          <button className="px-8 py-3.5 bg-amber-600 hover:bg-amber-500 text-black font-semibold rounded-lg transition shadow-lg shadow-amber-600/20">
            Browse Catalog
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        &copy; 2026 Legacy Goods E-Commerce Platform. All rights reserved.
      </footer>
    </div>
  );
}
