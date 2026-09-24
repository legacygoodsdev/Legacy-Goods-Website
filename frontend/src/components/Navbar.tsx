'use client';

import Link from 'next/link';
import { useState } from 'react';
import AccountDrawer from '@/components/AccountDrawer';
import { useAuth } from '@/context/AuthContext';

interface Props {
  cartCount: number;
  onBagClick: () => void;
  onPreviewNotice: () => void;
}

export default function Navbar({ cartCount, onBagClick, onPreviewNotice }: Props) {
  const { user, profile, isAdmin, loading, profileLoading, signOut } = useAuth();
  const [accountOpen, setAccountOpen] = useState(false);

  return (
    <>
      <header className="site-header">
        <Link href="/" className="brand-lockup" aria-label="Legacy Goods home">
          <span className="monogram">LG</span>
          <span><strong>LEGACY GOODS</strong><small>EST. 2026</small></span>
        </Link>
        <nav className="hidden items-center gap-8 text-xs font-semibold uppercase tracking-[0.2em] text-[#d7cbb8] md:flex" aria-label="Main navigation">
          <Link href="/#shop" className="nav-link">Shop</Link>
          <Link href="/#workshop" className="nav-link">Workshop</Link>
          <Link href="/#about" className="nav-link">About</Link>
          {!isAdmin && <button type="button" onClick={() => user ? setAccountOpen(true) : undefined} className="nav-link">Account</button>}
        </nav>
        <div className="header-actions">
          <a href="https://instagram.com/locacollection1" target="_blank" rel="noreferrer" className="hidden text-xs text-[#c5a059] transition hover:text-[#f4f1ea] sm:block">@locacollection1</a>
          {!loading && !profileLoading && isAdmin && (
            <>
              <span className="admin-badge">{profile?.admin_seq_id ?? 'ADMIN'}</span>
              <Link href="/admin" className="admin-studio-link">Admin Studio ↗</Link>
            </>
          )}
          {!loading && !profileLoading && !isAdmin && user && (
            <button type="button" onClick={() => setAccountOpen(true)} className="account-icon" aria-label="Open my profile">⌾</button>
          )}
          {!loading && !profileLoading && !user && <Link href="/login" className="admin-studio-link">Login / Sign Up</Link>}
          <button type="button" onClick={isAdmin || profileLoading ? onPreviewNotice : onBagClick} className="cart-button" aria-label={isAdmin ? 'Catalogue preview mode' : `Open shopping bag, ${cartCount} items`}>
            {isAdmin ? 'Preview only' : profileLoading ? 'Checking access' : <>Bag <span>{cartCount}</span></>}
          </button>
        </div>
      </header>
      {accountOpen && user && <AccountDrawer user={user} profile={profile} onClose={() => setAccountOpen(false)} onSignOut={() => { setAccountOpen(false); void signOut(); }} />}
    </>
  );
}
