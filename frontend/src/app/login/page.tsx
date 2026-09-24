'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const getNextPath = () => {
  const next = new URLSearchParams(window.location.search).get('next');
  return next?.startsWith('/') ? next : '/';
};

export default function LoginPage() {
  const router = useRouter();
  const { user, isAdmin, loading, profileLoading, signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !profileLoading && user) router.replace(isAdmin ? '/admin' : getNextPath());
  }, [isAdmin, loading, profileLoading, router, user]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage('');
    setError('');
    try {
      if (mode === 'signIn') {
        await signIn(email, password);
      } else {
        const result = await signUp(email, password);
        if (result.needsEmailConfirmation) setMessage('Check your email to confirm your account, then sign in.');
        else router.replace(getNextPath());
      }
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : 'Authentication failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link href="/" className="auth-back">← Back to Legacy Goods</Link>
        <div className="auth-monogram">LG</div>
        <p className="eyebrow text-[#c5a059]">Your place in the story</p>
        <h1 className="auth-title">{mode === 'signIn' ? 'Welcome back' : 'Create your account'}</h1>
        <p className="auth-subtitle">{mode === 'signIn' ? 'Sign in to continue to checkout.' : 'Create an account to place orders.'}</p>
        <div className="auth-toggle">
          <button type="button" onClick={() => setMode('signIn')} className={mode === 'signIn' ? 'active' : ''}>Sign In</button>
          <button type="button" onClick={() => setMode('signUp')} className={mode === 'signUp' ? 'active' : ''}>Sign Up</button>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          <label>Email<input type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="auth-input" /></label>
          <label>Password<input type="password" required minLength={6} autoComplete={mode === 'signIn' ? 'current-password' : 'new-password'} value={password} onChange={(event) => setPassword(event.target.value)} className="auth-input" /></label>
          {error && <p className="auth-error">{error}</p>}
          {message && <p className="auth-message">{message}</p>}
          <button type="submit" disabled={submitting} className="auth-submit">{submitting ? 'Please wait...' : mode === 'signIn' ? 'Sign In' : 'Create Account'}</button>
        </form>
      </section>
    </main>
  );
}
