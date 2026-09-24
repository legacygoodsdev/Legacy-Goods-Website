'use client';

import Link from 'next/link';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '@/lib/auth';

interface Props {
  user: User;
  profile: Profile | null;
  onClose: () => void;
  onSignOut: () => void;
}

export default function AccountDrawer({ user, profile, onClose, onSignOut }: Props) {
  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="My account">
      <button type="button" aria-label="Close account" onClick={onClose} className="absolute inset-0 bg-black/70" />
      <aside className="account-drawer">
        <div className="account-drawer-header">
          <div>
            <p className="eyebrow text-[#7c6232]">Private wardrobe</p>
            <h2 className="font-display text-3xl">My profile</h2>
          </div>
          <button type="button" onClick={onClose} className="text-2xl text-[#756b5e]" aria-label="Close account">&times;</button>
        </div>
        <div className="account-identity">
          <span className="account-avatar">{(profile?.display_name ?? user.email ?? 'L').slice(0, 1).toUpperCase()}</span>
          <div>
            <strong>{profile?.display_name ?? 'Legacy Goods customer'}</strong>
            <p>{user.email}</p>
          </div>
        </div>
        <nav className="account-links" aria-label="Account navigation">
          <button type="button" onClick={onClose}><span>01</span> My Profile</button>
          <button type="button" onClick={onClose}><span>02</span> My Orders</button>
          <button type="button" onClick={onClose}><span>03</span> Delivery Addresses</button>
        </nav>
        <div className="account-drawer-footer">
          <Link href="/" onClick={onClose}>Return to store</Link>
          <button type="button" onClick={onSignOut}>Log out</button>
        </div>
      </aside>
    </div>
  );
}
