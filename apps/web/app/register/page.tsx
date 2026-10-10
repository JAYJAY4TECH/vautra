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
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/register', {
        firstName,
        lastName,
        email,
        password,
        referralCode: referralCode || undefined,
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
    <main className="min-h-screen flex items-center justify-center px-6 py-10">
      <form
        onSubmit={submit}
        className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-8 space-y-5"
      >
        <div className="text-center">
          <Link href="/" className="text-2xl font-bold">
            Vault<span className="text-brand-500">ra</span>
          </Link>
          <h1 className="mt-3 text-xl font-semibold">Create your account</h1>
          <p className="text-sm text-slate-400 mt-1">
            Tell us a little about yourself
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-sm text-slate-400">First name</label>
            <input
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-white/10 focus:border-brand-500 outline-none transition"
              placeholder="John"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-slate-400">Last name</label>
            <input
              type="text"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-white/10 focus:border-brand-500 outline-none transition"
              placeholder="Doe"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm text-slate-400">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-white/10 focus:border-brand-500 outline-none transition"
            placeholder="you@example.com"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm text-slate-400">Password</label>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-white/10 focus:border-brand-500 outline-none transition"
            placeholder="At least 8 characters"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm text-slate-400">Referral code (optional)</label>
          <input
            type="text"
            value={referralCode}
            onChange={(e) => setReferralCode(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-white/10 focus:border-brand-500 outline-none transition"
            placeholder="VLT-XXXXXXXX"
          />
        </div>

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
          {loading ? 'Creating…' : 'Create account'}
        </button>

        <p className="text-sm text-slate-400 text-center">
          Already have an account?{' '}
          <Link href="/login" className="text-brand-500 hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </main>
  );
}
