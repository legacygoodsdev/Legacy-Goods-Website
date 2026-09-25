'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function AuthControls() {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return <span className="text-sm text-gray-400">Checking account...</span>;
  }

  if (!user) {
    return (
      <Link
        href="/login.html"
        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
      >
        Login / Sign Up
      </Link>
    );
  }

  return (
    <details className="relative">
      <summary className="cursor-pointer list-none rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm">
        Profile / Logout
      </summary>
      <div className="absolute right-0 top-12 z-20 w-64 rounded-lg border border-gray-200 bg-white p-4 shadow-lg">
        <p className="truncate text-sm font-medium text-gray-900">{user.email ?? user.id}</p>
        <p className="mt-1 text-xs text-gray-500">Signed in to Legacy Goods</p>
        <button
          type="button"
          onClick={() => void signOut()}
          className="mt-3 w-full rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-gray-700"
        >
          Logout
        </button>
      </div>
    </details>
  );
}
