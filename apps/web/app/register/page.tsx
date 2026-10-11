'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/register', {
        email,
        password,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        referralCode: referralCode || undefined,
        subscribed,
      });
      localStorage.setItem('vaultra_token', data.accessToken);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col lg:flex-row">
      {/* Left marketing panel */}
      <aside className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-gradient-to-br from-brand-900 via-brand-700 to-brand-500 p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-20 right-20 w-96 h-96 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-20 left-20 w-72 h-72 rounded-full bg-brand-500 blur-3xl" />
        </div>

        <div className="relative z-10">
          <Link href="/" className="text-3xl font-bold text-white">
            Vault<span className="text-brand-100">ra</span>
          </Link>
        </div>

        <div className="relative z-10 max-w-lg">
          <h1 className="text-5xl font-bold text-white leading-tight mb-4">
            Grow your stake.
            <br />
            Unlock your yield.
          </h1>
          <p className="text-brand-100 text-lg mb-10">
            Tiered plans, daily accruals, and referral rewards — all in one
            dashboard. Start small, grow steady, unlock big.
          </p>

          <div className="space-y-4">
            <Feature text="Tiered investment plans" />
            <Feature text="Daily accrual rewards" />
            <Feature text="Referral commissions up to 12%" />
            <Feature text="Secure wallet-based deposits" />
          </div>
        </div>

        <div className="relative z-10 text-brand-100 text-sm">
          © {new Date().getFullYear()} Vaultra — Invest smart, unlock big.
        </div>
      </aside>

      {/* Right form panel */}
      <section className="flex-1 flex items-center justify-center px-6 py-12 bg-slate-950">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="text-3xl font-bold">
              Vault<span className="text-brand-500">ra</span>
            </Link>
          </div>

          <h2 className="text-3xl font-bold mb-2">Create new account</h2>
          <p className="text-sm text-slate-400 mb-8">
            Already registered?{' '}
            <Link href="/login" className="text-brand-500 hover:underline">
              Log in
            </Link>
          </p>

          {/* Social button — Google only */}
          <button
            type="button"
            onClick={() => router.push('/coming-soon')}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition text-sm font-medium mb-6"
          >
            <span className="text-lg">G</span>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-slate-500 uppercase tracking-wider">
              or sign up with email
            </span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-slate-400 block mb-1">
                  First name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                  className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-white/10 focus:border-brand-500 outline-none transition"
                />
              </div>
              <div>
                <label className="text-sm text-slate-400 block mb-1">
                  Last name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-white/10 focus:border-brand-500 outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-slate-400 block mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-white/10 focus:border-brand-500 outline-none transition"
              />
            </div>

            <div>
              <label className="text-sm text-slate-400 block mb-1">
                Password
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-white/10 focus:border-brand-500 outline-none transition"
              />
            </div>

            <div>
              <label className="text-sm text-slate-400 block mb-1">
                Referral code (optional)
              </label>
              <input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                placeholder="VLT-XXXXXXXX"
                className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-white/10 focus:border-brand-500 outline-none transition"
              />
            </div>

            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={subscribed}
                onChange={(e) => setSubscribed(e.target.checked)}
                className="mt-1 w-4 h-4 accent-brand-500"
              />
              <span className="text-sm text-slate-400">
                Subscribe to our newsletter. No spam, unsubscribe anytime.
              </span>
            </label>

            {error && (
              <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-brand-500 hover:bg-brand-600 font-medium transition disabled:opacity-50"
            >
              {loading ? 'Creating account…' : 'Create your account'}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

function Feature({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 text-brand-100">
      <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs">
        ✓
      </div>
      <span>{text}</span>
    </div>
  );
}