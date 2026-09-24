'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { supabase } from '@/lib/supabaseClient';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
}

export default function Storefront() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const p = query.get('p');
    if (p) {
      router.replace(p);
      return;
    }

    async function fetchProducts() {
      try {
        const { data, error } = await supabase.from('products').select('*');
        if (data && !error) {
          setProducts(data);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto p-8">
        <div className="mb-12 text-center py-12 bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-2xl shadow-xl">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
            Timeless Craftsmanship. <span className="text-amber-500">Modern Standard.</span>
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-base md:text-lg">
            Explore our curated catalog of industrial-grade products built to last. Secure transactions, verified quality.
          </p>
        </div>

        <h2 className="text-2xl font-bold tracking-wide text-slate-200 mb-6 border-b border-slate-800 pb-3">
          Available Inventory
        </h2>

        {loading ? (
          <div className="text-center py-20 text-slate-400 animate-pulse">Loading catalog...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/40 border border-slate-800 rounded-xl">
            <p className="text-slate-400">No products currently listed in the catalog.</p>
            <p className="text-xs text-slate-500 mt-2">Admins can add products via the Admin Suite.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between hover:border-slate-700 transition">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">{product.name}</h3>
                  <p className="text-slate-400 text-sm mb-4 line-clamp-3">{product.description}</p>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-800">
                  <span className="text-xl font-bold text-amber-500"></span>
                  <span className="text-xs text-slate-500">Stock: {product.stock}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        &copy; 2026 Legacy Goods E-Commerce Platform. All rights reserved.
      </footer>
    </div>
  );
}
