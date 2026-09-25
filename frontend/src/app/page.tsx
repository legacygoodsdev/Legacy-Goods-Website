'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchProducts } from '@/lib/api';
import type { CartItem, Product, ProductCategory } from '@/types';
import CheckoutModal from '@/components/CheckoutModal';
import CartDrawer from '@/components/CartDrawer';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { brand } from '@/lib/brand';

const categories: Array<'All' | ProductCategory> = ['All', 'Women', 'Men', 'Footwear', 'Accessories'];
const fallbackProducts: Product[] = [
  { id: 'meher-festive-suit', title: 'Meher Festive Embroidered Suit', description: 'A softly structured festive edit with hand-finished detail and a modern Pakistani silhouette.', price: 11990, image_url: null, stock: 8, created_at: '2026-01-01' },
  { id: 'rayan-kurta-waistcoat', title: 'Rayan Kurta Waistcoat Set', description: 'A crisp, considered set for celebrations, cut in breathable local cotton.', price: 8990, image_url: null, stock: 10, created_at: '2026-01-01' },
  { id: 'naveed-embroidered-waistcoat', title: 'Naveed Embroidered Waistcoat', description: 'Quiet texture, warm neutral tones and a finish made for the occasion.', price: 14990, image_url: null, stock: 6, created_at: '2026-01-01' },
  { id: 'noor-mint-lawn-suit', title: 'Noor Mint Lawn 3-Piece', description: 'Lightweight lawn in a fresh mint palette, made for long summer afternoons.', price: 6490, image_url: null, stock: 15, created_at: '2026-01-01' },
  { id: 'gul-teal-khussa', title: 'Gul Teal Embroidered Khussa', description: 'A hand-finished classic with a softly pointed toe and a little colour.', price: 4490, image_url: null, stock: 12, created_at: '2026-01-01' },
  { id: 'mina-festive-clutch', title: 'Mina Festive Clutch', description: 'A small evening companion with a tactile finish and just enough shine.', price: 5990, image_url: null, stock: 9, created_at: '2026-01-01' },
];

const categoryFor = (product: Product): ProductCategory => {
  const name = `${product.title} ${product.description ?? ''}`.toLowerCase();
  if (name.includes('khussa') || name.includes('chappal') || name.includes('shoe')) return 'Footwear';
  if (name.includes('waistcoat') || name.includes('kurta') || name.includes('men')) return 'Men';
  if (name.includes('suit') || name.includes('lawn') || name.includes('dupatta') || name.includes('women')) return 'Women';
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
    const text = `${product.title} ${product.description ?? ''}`.toLowerCase();
    return (activeCategory === 'All' || category === activeCategory) && text.includes(search.toLowerCase());
  });
  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const previewNotice = () => setToast('Catalogue Preview Mode - Admins cannot place orders.');
  const addToCart = (product: Product) => {
    if (user && profileLoading) return setToast('Checking account access...');
    if (isAdmin) return previewNotice();
    if (!user) return router.push('/login');
    setCart((current) => {
      const existing = current.find((item) => item.product.id === product.id);
      return existing ? current.map((item) => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item) : [...current, { product, category: categoryFor(product), quantity: 1 }];
    });
    setCartOpen(true);
  };
  const updateQuantity = (productId: string, quantity: number) => setCart((current) => quantity <= 0 ? current.filter((item) => item.product.id !== productId) : current.map((item) => item.product.id === productId ? { ...item, quantity } : item));
  const handleCheckout = () => {
    if (user && profileLoading) return setToast('Checking account access...');
    if (isAdmin) return previewNotice();
    if (!user) return router.push('/login');
    if (cart.length) { setCartOpen(false); setCheckoutOpen(true); }
  };

  return (
    <main className="storefront">
      <div className="announcement-bar">{brand.tagline} <span>COD nationwide / Placeholder delivery policy</span></div>
      <Navbar cartCount={cartCount} onBagClick={() => setCartOpen(true)} onPreviewNotice={previewNotice} />
      <section id="top" className="editorial-hero">
        <div className="hero-copy"><p className="eyebrow text-[#c5a059]">A Legacy Goods edit</p><h1>Quiet luxury.<br /><em>Pakistani soul.</em></h1><p className="hero-intro">Clothing, footwear and finishing pieces curated for everyday dressing and the occasions that matter.</p><a href="#shop" className="bronze-button">Shop the edit <span>-&gt;</span></a></div>
        <div className="hero-portrait" aria-label="Legacy Goods collection preview"><span>LG</span><small>MADE WITH FEELING<br />IN PAKISTAN</small></div>
      </section>
      <div className="service-ribbon"><span>01 <strong>COD nationwide</strong> Pay at your doorstep.</span><span>02 <strong>Curated locally</strong> Pieces with Pakistani texture.</span><span>03 <strong>Placeholders</strong> Replace policies before launch.</span><span>04 <strong>Account checkout</strong> Save your bag and track orders.</span></div>
      <section className="category-showcase" aria-label="Shop by category"><div className="category-intro"><p className="eyebrow text-[#c5a059]">Find your next favourite</p><h2>Start with a<br /><em>category.</em></h2></div>{[['01', 'Women', 'Lawn, pret and easy pieces.'], ['02', 'Men', 'Classic, never sleepy.'], ['03', 'Footwear', 'Khussa and chappal, finished properly.'], ['04', 'Accessories', 'Small luxuries people notice.']].map(([number, title, copy]) => <a href="#shop" key={title} className="category-tile"><span>{number}</span><h3>{title}</h3><p>{copy}</p><strong>Explore -&gt;</strong></a>)}</section>
      <section id="shop" className="shop-section"><div className="section-heading"><div><p className="eyebrow text-[#7c6232]">The current edit</p><h2>Best of {brand.name}.</h2></div><p className="section-lede">Only active products from the production catalogue appear here. If it is not in Supabase, it does not exist in the store.</p></div><div className="filter-bar"><div className="category-tabs" role="tablist" aria-label="Product categories">{categories.map((category) => <button key={category} type="button" onClick={() => setActiveCategory(category)} className={activeCategory === category ? 'category-tab active' : 'category-tab'}>{category}</button>)}</div><label className="search-field"><span>Search</span><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find a piece" /></label></div>{loading ? <div className="catalog-message">Gathering the collection...</div> : filteredProducts.length === 0 ? <div className="catalog-message">No pieces match that search.</div> : <div className="product-grid">{filteredProducts.map((product, index) => { const category = categoryFor(product); return <article key={product.id} className="product-card" style={{ animationDelay: `${index * 80}ms` }}><div className={`product-art product-art-${category.toLowerCase()}`}>{product.image_url && <div className="product-photo" style={{ backgroundImage: `url(${product.image_url})` }} />}<span>{product.title.slice(0, 2).toUpperCase()}</span><small>{category}</small></div><div className="product-info"><p className="eyebrow text-[#7c6232]">{category}</p><h3>{product.title}</h3><p className="product-description">{product.description}</p><div className="product-footer"><strong>{formatPrice(product.price)}</strong><button type="button" onClick={() => addToCart(product)} className="text-button">Add to bag <span>-&gt;</span></button></div></div></article>; })}</div>}</section>
      <section className="editorial-section" id="workshop"><div><p className="eyebrow text-[#c5a059]">The {brand.name} point of view</p><h2>Wear the good<br /><em>ordinary.</em></h2></div><div><p>We choose pieces for the moments that do not need a reason: an afternoon in Lahore, a dinner in Karachi, a day that becomes a memory.</p><a href="#about" className="text-button">Read our story -&gt;</a></div></section>
      <section id="about" className="about-section"><p className="eyebrow text-[#7c6232]">Our point of view</p><h2>Less noise.<br /><em>More feeling.</em></h2><p>We make fewer things, better. Thoughtful goods for daily rituals, designed in Pakistan and made to cross generations.</p></section>
      <footer className="site-footer"><div><span className="monogram small">LG</span><p>{brand.name} / {brand.established}</p><span>Thoughtful pieces, designed and crafted in Pakistan.</span></div><div><strong>Customer care</strong><span>{brand.supportEmail}</span><span>{brand.supportPhone}</span><span>{brand.supportHours}</span></div><div><strong>Useful links</strong><a href="#shop">New arrivals</a><a href="#about">Our story</a><a href="#">Store locator [placeholder]</a><a href="#">Order tracking [placeholder]</a></div><div><strong>Policies</strong><a href="#">Terms &amp; conditions [placeholder]</a><a href="#">Privacy policy [placeholder]</a><a href="#">Exchange &amp; refund [placeholder]</a><div className="payment-badges"><span>VISA</span><span>MC</span><span>COD</span></div></div><div><strong>Sign up for the newsletter</strong><span>New edits and seasonal stories, no noise.</span><form className="newsletter-form" onSubmit={(event) => event.preventDefault()}><input type="email" required placeholder="Your email address" aria-label="Email address" /><button type="submit">Join -&gt;</button></form><span>{brand.instagram} / {brand.address}</span></div></footer>
      {toast && <div className="preview-toast" role="status">{toast}</div>}
      {cartOpen && <CartDrawer items={cart} total={cartTotal} onClose={() => setCartOpen(false)} onChangeQuantity={updateQuantity} onRemove={(productId) => updateQuantity(productId, 0)} onCheckout={handleCheckout} />}
      {checkoutOpen && cart.length > 0 && <CheckoutModal items={cart} totalAmount={cartTotal} onClose={() => setCheckoutOpen(false)} />}
    </main>
  );
}
