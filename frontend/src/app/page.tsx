'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const p = query.get('p');
    if (p) {
      router.replace(p);
    }
  }, [router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-slate-950 text-white">
      <h1 className="text-4xl font-bold tracking-wider text-amber-500 mb-4">LEGACY GOODS</h1>
      <p className="text-slate-400 mb-8">Industrial-Standard E-Commerce Platform</p>
      <div className="flex gap-4">
        <a 
          href="/Legacy-Goods-Website/admin" 
          className="px-6 py-3 bg-amber-600 hover:bg-amber-500 rounded-lg font-medium transition text-black"
        >
          Go to Admin Suite
        </a>
      </div>
    </main>
  );
}
