'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchProducts } from '@/lib/api';
import type { CartItem, Product, ProductCategory } from '@/types';
import CheckoutModal from '@/components/CheckoutModal';
import CartDrawer from '@/components/CartDrawer';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';

const categories: Array<'All' | ProductCategory> = ['All', 'Apparel', 'Leather Goods', 'Accessories'];
const fallbackProducts: Product[] = [
  { id: 'heritage-denim-jacket', title: 'Heritage Denim Jacket', description: 'Heavyweight cotton denim, cut and finished in Lahore for a lifetime of wear.', price: 12500, image_url: null, stock: 8, created_at: '2026-01-01' },
  { id: 'leather-cardholder', title: 'Handcrafted Leather Cardholder', description: 'Full-grain leather, burnished edges and a quiet patina that gets better with time.', price: 3800, image_url: null, stock: 24, created_at: '2026-01-01' },
  { id: 'pakistani-cotton-shirt', title: 'Bespoke Pakistani Cotton Shirt', description: 'Breathable local cotton with a relaxed silhouette made for warm days and long nights.', price: 7200, image_url: null, stock: 12, created_at: '2026-01-01' },
];

const categoryFor = (product: Product): ProductCategory => {
  const name = `${product.title} ${product.description ?? ''}`.toLowerCase();
  if (name.includes('leather') || name.includes('cardholder')) return 'Leather Goods';
  if (name.includes('shirt') || name.includes('jacket') || name.includes('cotton') || name.includes('denim')) return 'Apparel';
  return 'Accessories';
};

const formatPrice = (amount: number) => `PKR ${amount.toLocaleString('en-PK')}`;

export default function Home() {
  const router = useRouter();
  const { user, isAdmin, profileLoading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<(typeof categories)[number]>('All');
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await fetchProducts();
        setProducts(data.length > 0 ? data : fallbackProducts);
      } catch {
        setProducts(fallbackProducts);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(''), 3500);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const filteredProducts = products.filter((product) => {
    const category = categoryFor(product);
    const matchesCategory = activeCategory === 'All' || category === activeCategory;
    const searchText = `${product.title} ${product.description ?? ''}`.toLowerCase();
    return matchesCategory && searchText.includes(search.toLowerCase());
  });
  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const addToCart = (product: Product) => {
    if (user && profileLoading) {
      setToast('Checking account access...');
      return;
    }
    if (isAdmin) {
      setToast('Catalogue Preview Mode - Admins cannot place orders.');
      return;
    }
    if (!user) {
      router.push('/login');
      return;
    }
    setCart((currentCart) => {
      const existing = currentCart.find((item) => item.product.id === product.id);
      if (existing) return currentCart.map((item) => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...currentCart, { product, category: categoryFor(product), quantity: 1 }];
    });
    setCartOpen(true);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart((currentCart) => currentCart.filter((item) => item.product.id !== productId));
      return;
    }
    setCart((currentCart) => currentCart.map((item) => item.product.id === productId ? { ...item, quantity } : item));
  };

  const handleCheckout = () => {
    if (user && profileLoading) {
      setToast('Checking account access...');
      return;
    }
    if (isAdmin) {
      setToast('Catalogue Preview Mode - Admins cannot place orders.');
      return;
    }
    if (!user) {
      router.push('/login');
      return;
    }
    if (cart.length > 0) {
      setCartOpen(false);
      setCheckoutOpen(true);
    }
  };

  return (
    <main className="site-shell min-h-screen">
      <Navbar cartCount={cartCount} onBagClick={() => setCartOpen(true)} onPreviewNotice={() => setToast('Catalogue Preview Mode - Admins cannot place orders.')} />
      <section id="top" className="hero-section"><div className="hero-copy"><p className="eyebrow text-[#c5a059]">Designed &amp; Crafted in Pakistan</p><h1>Quiet luxury.<br /><em>Pakistani soul.</em></h1><p className="hero-intro">Considered clothing and carry goods for daily rituals, selected with feeling and made to stay with you.</p><a href="#shop" className="bronze-button">Shop the edit <span>-&gt;</span></a></div><div className="hero-stamp" aria-hidden="true"><span>LG</span><small>MADE WITH FEELING<br />IN PAKISTAN</small></div><div className="flag-detail" aria-hidden="true" /></section>
      <section className="category-showcase" aria-label="Shop by category"><div className="category-intro"><p className="eyebrow text-[#c5a059]">Find your next favourite</p><h2>Start with a<br /><em>category.</em></h2></div>{[['01', 'Apparel', 'Daily pieces, cut with feeling.'], ['02', 'Leather Goods', 'Small luxuries, made to last.'], ['03', 'Accessories', 'The finishing touch, considered.']].map(([number, title, copy]) => <a href="#shop" key={title} className="category-tile"><span>{number}</span><h3>{title}</h3><p>{copy}</p><strong>Explore -&gt;</strong></a>)}</section>
      <section id="shop" className="shop-section"><div className="section-heading"><div><p className="eyebrow text-[#7c6232]">The current edit</p><h2>Made to be kept.</h2></div><p className="max-w-sm text-sm leading-6 text-[#756b5e]">Small-batch pieces with honest materials, useful forms, and the marks of the hands that made them.</p></div><div className="filter-bar"><div className="category-tabs" role="tablist" aria-label="Product categories">{categories.map((category) => <button key={category} type="button" onClick={() => setActiveCategory(category)} className={activeCategory === category ? 'category-tab active' : 'category-tab'}>{category}</button>)}</div><label className="search-field"><span>Search</span><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find a piece" /></label></div>{loading ? <div className="catalog-message">Gathering the collection...</div> : filteredProducts.length === 0 ? <div className="catalog-message">No pieces match that search.</div> : <div className="product-grid">{filteredProducts.map((product, index) => { const category = categoryFor(product); return <article key={product.id} className="product-card" style={{ animationDelay: `${index * 80}ms` }}><div className={`product-art product-art-${category.toLowerCase().replace(' ', '-')}`}>{product.image_url && <div className="product-photo" style={{ backgroundImage: `url(${product.image_url})` }} />}<span>{product.title.slice(0, 2).toUpperCase()}</span><small>{category}</small></div><div className="product-info"><p className="eyebrow text-[#7c6232]">{category}</p><h3>{product.title}</h3><p className="product-description">{product.description}</p><div className="product-footer"><strong>{formatPrice(product.price)}</strong><button type="button" onClick={() => addToCart(product)} className="text-button">Add to bag <span>-&gt;</span></button></div></div></article>; })}</div>}</section>
      <section className="editorial-section" id="workshop"><div><p className="eyebrow text-[#c5a059]">The Legacy Goods point of view</p><h2>Wear the good<br /><em>ordinary.</em></h2></div><div><p>We choose pieces for the moments that do not need a reason: an afternoon in Lahore, a dinner in Karachi, a day that becomes a memory.</p><a href="#about" className="text-button">Read our story -&gt;</a></div></section>
      <section id="about" className="about-section"><p className="eyebrow text-[#7c6232]">Our point of view</p><h2>Less noise.<br /><em>More feeling.</em></h2><p>We make fewer things, better. Thoughtful goods for daily rituals, designed in Pakistan and made to cross generations.</p></section>
      <footer className="site-footer"><span className="monogram small">LG</span><span>LEGACY GOODS / EST. 2026</span><span>Contact: [replace with email] | Support: [replace with phone]</span></footer>
      {toast && <div className="preview-toast" role="status">{toast}</div>}
      {cartOpen && <CartDrawer items={cart} total={cartTotal} onClose={() => setCartOpen(false)} onChangeQuantity={updateQuantity} onRemove={(productId) => updateQuantity(productId, 0)} onCheckout={handleCheckout} />}
      {checkoutOpen && cart.length > 0 && <CheckoutModal items={cart} totalAmount={cartTotal} onClose={() => setCheckoutOpen(false)} />}
    </main>
  );
}

