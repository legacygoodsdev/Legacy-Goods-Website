'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function SignupPage() {
  const router = useRouter();
  const { user, loading, profileLoading, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !profileLoading && user) router.replace('/');
  }, [loading, profileLoading, router, user]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const result = await signUp(email.trim(), password);
      if (result.needsEmailConfirmation) {
        setSubmitted(true);
      } else {
        router.replace('/');
      }
    } catch (signupError) {
      setError(signupError instanceof Error ? signupError.message : 'Unable to create your account.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link href="/" className="auth-back">← Back to Legacy Goods</Link>
        <div className="auth-monogram">LG</div>
        {submitted ? (
          <>
            <p className="eyebrow text-[#c5a059]">One last detail</p>
            <h1 className="auth-title">Check your inbox.</h1>
            <p className="auth-subtitle">We sent a verification link to <strong>{email}</strong>. Confirm your email before signing in.</p>
            <Link href="/login" className="auth-submit block text-center">Return to sign in</Link>
          </>
        ) : (
          <>
            <p className="eyebrow text-[#c5a059]">Join the collection</p>
            <h1 className="auth-title">Make it yours.</h1>
            <p className="auth-subtitle">Create an account to save your details and place orders.</p>
            <form onSubmit={handleSubmit} className="auth-form">
              <label>Email<input type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="auth-input" /></label>
              <label>Password<input type="password" required minLength={6} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className="auth-input" /></label>
              {error && <p className="auth-error">{error}</p>}
              <button type="submit" disabled={submitting} className="auth-submit">{submitting ? 'Creating account...' : 'Create account'}</button>
            </form>
            <p className="auth-subtitle mt-5 text-center">Already registered? <Link href="/login" className="text-[#01411c] underline">Sign in</Link></p>
          </>
        )}
      </section>
    </main>
  );
}
