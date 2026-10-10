'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

type Plan = {
  id: string;
  name: string;
  tier: number;
  ratePerDay: string;
  lockDays: number;
  minDeposit: string;
  minWithdraw: string;
  referralPct: string;
};

type Investment = {
  id: string;
  principal: string;
  accrued: string;
  maturesAt: string;
  status: string;
  plan: Plan;
};

type Eligibility = {
  canWithdraw: boolean;
  reason?: string;
  needed?: number;
  count?: number;
  balance?: number;
};

type WalletRow = {
  id: string;
  coin: string;
  address: string;
  network: string | null;
};

export default function DashboardPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [eligibility, setEligibility] = useState<Eligibility | null>(null);
  const [wallets, setWallets] = useState<WalletRow[]>([]);
  const [balance, setBalance] = useState(0);
  const [myReferral, setMyReferral] = useState('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  // modal state
  const [modalPlan, setModalPlan] = useState<Plan | null>(null);
  const [amount, setAmount] = useState('');
  const [modalError, setModalError] = useState('');
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('vaultra_token');
    if (!token) {
      router.push('/login');
      return;
    }
    load();
  }, []);

  async function load() {
    try {
      const [p, i, e, w, me] = await Promise.all([
        api.get('/plans'),
        api.get('/investments'),
        api.get('/withdrawals/eligibility'),
        api.get('/admin/wallets/public').catch(() => ({ data: [] })),
        api.get('/auth/me').catch(() => ({ data: null })),
      ]);
      setPlans(p.data);
      setInvestments(i.data);
      setEligibility(e.data);
      setWallets(w.data);
      if (me.data) {
        setMyReferral(me.data.referralCode);
        setBalance(me.data.balance);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function submitInvest(e: React.FormEvent) {
    e.preventDefault();
    if (!modalPlan) return;
    setModalLoading(true);
    setModalError('');
    try {
      await api.post('/investments', {
        planId: modalPlan.id,
        amount: Number(amount),
      });
      setModalPlan(null);
      setAmount('');
      await load();
    } catch (err: any) {
      setModalError(err.response?.data?.message ?? 'Investment failed');
    } finally {
      setModalLoading(false);
    }
  }

  function copy(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  }

  function logout() {
    localStorage.removeItem('vaultra_token');
    router.push('/login');
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-slate-400">Loading dashboard…</p>
      </main>
    );
  }

  const totalAccrued = investments.reduce(
    (sum, inv) => sum + Number(inv.accrued),
    0,
  );
  const totalPrincipal = investments.reduce(
    (sum, inv) => sum + Number(inv.principal),
    0,
  );

  return (
    <main className="min-h-screen px-6 py-8 max-w-6xl mx-auto">
      <header className="flex items-center justify-between mb-10">
        <Link href="/" className="text-2xl font-bold">
          Vault<span className="text-brand-500">ra</span>
        </Link>
        <button
          onClick={logout}
          className="px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 transition text-sm"
        >
          Log out
        </button>
      </header>

      <section className="grid md:grid-cols-4 gap-5 mb-10">
        <StatCard label="Available balance" value={balance.toFixed(2)} />
        <StatCard label="Invested" value={totalPrincipal.toFixed(2)} />
        <StatCard label="Accrued yield" value={totalAccrued.toFixed(2)} accent />
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <p className="text-slate-400 text-sm">Withdrawals</p>
          <p className="text-sm font-semibold mt-2">
            {eligibility?.canWithdraw ? (
              <span className="text-green-400">Unlocked ✅</span>
            ) : (
              <span className="text-yellow-400">
                Locked
                <br />
                <span className="text-slate-500 text-xs">
                  {eligibility?.reason}
                  {eligibility?.needed
                    ? ` · need ${eligibility.needed.toFixed(0)} more`
                    : ''}
                </span>
              </span>
            )}
          </p>
        </div>
      </section>

      {/* Referral link */}
      {myReferral && (
        <section className="mb-10">
          <div className="bg-gradient-to-r from-brand-500/20 to-brand-700/10 border border-brand-500/30 rounded-2xl p-6">
            <p className="text-sm text-slate-300 mb-1">Your referral link</p>
            <p className="text-xs text-slate-500 mb-3">
              Share this — earn commission on every investment your referrals make
            </p>
            <div className="flex gap-2">
              <input
                readOnly
                value={`http://localhost:3000/register?ref=${myReferral}`}
                className="flex-1 px-4 py-3 rounded-lg bg-slate-950 border border-white/10 font-mono text-xs"
              />
              <button
                onClick={() =>
                  copy(
                    `http://localhost:3000/register?ref=${myReferral}`,
                    'ref',
                  )
                }
                className="px-5 py-3 rounded-lg bg-brand-500 hover:bg-brand-600 text-sm font-medium"
              >
                {copied === 'ref' ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Deposit wallets */}
      {wallets.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-2">Deposit crypto</h2>
          <p className="text-sm text-slate-400 mb-4">
            Send crypto to any of these addresses. Your balance will be credited
            once we confirm the deposit.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {wallets.map((w) => (
              <div
                key={w.id}
                className="bg-white/5 border border-white/10 rounded-xl p-5"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold text-brand-500">{w.coin}</p>
                    {w.network && (
                      <p className="text-xs text-slate-500">{w.network}</p>
                    )}
                  </div>
                </div>
                <p className="font-mono text-xs text-slate-300 break-all mb-3">
                  {w.address}
                </p>
                <button
                  onClick={() => copy(w.address, w.id)}
                  className="w-full py-2 rounded-lg border border-white/10 hover:bg-white/5 text-xs font-medium transition"
                >
                  {copied === w.id ? '✅ Copied' : 'Copy address'}
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Investment plans</h2>
        <div className="grid md:grid-cols-3 gap-5">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-brand-500 transition"
            >
              <p className="text-brand-500 font-semibold text-sm">
                Tier {plan.tier}
              </p>
              <h3 className="text-2xl font-bold mt-1">{plan.name}</h3>
              <p className="text-slate-400 text-sm mt-3">
                {plan.ratePerDay}% daily · locked {plan.lockDays} days
              </p>
              <div className="mt-5 text-sm space-y-1 text-slate-300">
                <p>Min deposit: {plan.minDeposit}</p>
                <p>Min withdraw: {plan.minWithdraw}</p>
                <p>Referral: {plan.referralPct}%</p>
              </div>
              <button
                onClick={() => {
                  setModalPlan(plan);
                  setAmount(plan.minDeposit);
                  setModalError('');
                }}
                className="w-full mt-6 py-2.5 rounded-lg bg-brand-500 hover:bg-brand-600 transition font-medium"
              >
                Invest
              </button>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Your investments</h2>
        {investments.length === 0 ? (
          <p className="text-slate-400 text-sm">
            No investments yet. Pick a plan above to start.
          </p>
        ) : (
          <div className="space-y-3">
            {investments.map((inv) => (
              <div
                key={inv.id}
                className="bg-white/5 border border-white/10 rounded-xl p-5 flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold">{inv.plan.name}</p>
                  <p className="text-sm text-slate-400">
                    Principal: {inv.principal} · Accrued: {Number(inv.accrued).toFixed(2)}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Matures: {new Date(inv.maturesAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-xs px-3 py-1 rounded-full bg-white/10">
                  {inv.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {modalPlan && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center px-6 z-50"
          onClick={() => !modalLoading && setModalPlan(null)}
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={submitInvest}
            className="w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl p-6 space-y-4"
          >
            <div>
              <p className="text-brand-500 text-sm font-semibold">
                Tier {modalPlan.tier}
              </p>
              <h3 className="text-2xl font-bold mt-1">
                Invest in {modalPlan.name}
              </h3>
              <p className="text-slate-400 text-sm mt-1">
                {modalPlan.ratePerDay}% daily · locked {modalPlan.lockDays} days
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-sm text-slate-400">Amount</label>
              <input
                type="number"
                required
                min={Number(modalPlan.minDeposit)}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-slate-950 border border-white/10 focus:border-brand-500 outline-none"
              />
              <p className="text-xs text-slate-500">
                Minimum: {modalPlan.minDeposit} · Your balance: {balance.toFixed(2)}
              </p>
            </div>

            {modalError && (
              <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {modalError}
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setModalPlan(null)}
                disabled={modalLoading}
                className="flex-1 py-3 rounded-lg border border-white/10 hover:bg-white/5 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={modalLoading}
                className="flex-1 py-3 rounded-lg bg-brand-500 hover:bg-brand-600 font-medium transition disabled:opacity-50"
              >
                {modalLoading ? 'Investing…' : 'Confirm'}
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      <p className="text-slate-400 text-sm">{label}</p>
      <p
        className={`text-3xl font-bold mt-2 ${
          accent ? 'text-brand-500' : ''
        }`}
      >
        {value}
      </p>
    </div>
  );
}