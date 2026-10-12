'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

type AdminUser = {
  id: string;
  email: string;
  referralCode: string;
  isAdmin: boolean;
  walletAddress: string | null;
  balance: number;
  investmentCount: number;
  createdAt: string;
};

type WalletRow = {
  id: string;
  coin: string;
  address: string;
  network: string | null;
};

type Withdrawal = {
  id: string;
  userId: string;
  amount: string;
  status: string;
  createdAt: string;
  user: { email: string };
};

export default function AdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'users' | 'wallets' | 'withdrawals'>('users');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [wallets, setWallets] = useState<WalletRow[]>([]);
  const [pending, setPending] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);

  // credit form
  const [creditUser, setCreditUser] = useState<AdminUser | null>(null);
  const [creditAmount, setCreditAmount] = useState('');
  const [creditNote, setCreditNote] = useState('');
  const [creditError, setCreditError] = useState('');

  // wallet edit
  const [editWallet, setEditWallet] = useState<WalletRow | null>(null);
  const [editAddress, setEditAddress] = useState('');
  const [editNetwork, setEditNetwork] = useState('');

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
      const [u, w, p] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/wallets'),
        api.get('/admin/withdrawals/pending'),
      ]);
      setUsers(u.data);
      setWallets(w.data);
      setPending(p.data);
    } catch (err: any) {
      if (err.response?.status === 403) {
        alert('You are not an admin');
        router.push('/dashboard');
      }
    } finally {
      setLoading(false);
    }
  }

  async function submitCredit(e: React.FormEvent) {
    e.preventDefault();
    if (!creditUser) return;
    setCreditError('');
    try {
      await api.post(`/admin/users/${creditUser.id}/credit`, {
        amount: Number(creditAmount),
        note: creditNote || 'Admin credit',
      });
      setCreditUser(null);
      setCreditAmount('');
      setCreditNote('');
      await load();
    } catch (err: any) {
      setCreditError(err.response?.data?.message ?? 'Credit failed');
    }
  }

  async function submitWallet(e: React.FormEvent) {
    e.preventDefault();
    if (!editWallet) return;
    try {
      await api.patch(`/admin/wallets/${editWallet.coin}`, {
        address: editAddress,
        network: editNetwork,
      });
      setEditWallet(null);
      await load();
    } catch (err) {
      alert('Update failed');
    }
  }

  async function review(id: string, action: 'APPROVE' | 'REJECT') {
    await api.post(`/admin/withdrawals/${id}/review`, { action });
    await load();
  }

  function logout() {
    localStorage.removeItem('vaultra_token');
    router.push('/login');
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-slate-400">Loading admin…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 py-8 max-w-7xl mx-auto">
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-2xl font-bold">
            Vault<span className="text-brand-500">ra</span>
          </Link>
          <span className="text-xs px-2 py-1 rounded bg-brand-500/20 text-brand-500 font-semibold">
            ADMIN
          </span>
        </div>
        <div className="flex gap-3">
          <Link
            href="/dashboard"
            className="px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 text-sm"
          >
            User view
          </Link>
          <button
            onClick={logout}
            className="px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 text-sm"
          >
            Log out
          </button>
        </div>
      </header>

      <nav className="flex gap-2 mb-6 border-b border-white/10">
        {(['users', 'wallets', 'withdrawals'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize ${
              tab === t
                ? 'text-brand-500 border-b-2 border-brand-500'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t}
            {t === 'withdrawals' && pending.length > 0 && (
              <span className="ml-2 px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs">
                {pending.length}
              </span>
            )}
          </button>
        ))}
      </nav>

      {tab === 'users' && (
        <section className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 border-b border-white/10">
                <th className="py-3 px-3">Email</th>
                <th className="py-3 px-3">Wallet</th>
                <th className="py-3 px-3">Referral</th>
                <th className="py-3 px-3 text-right">Balance</th>
                <th className="py-3 px-3 text-right">Investments</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-3 px-3">
                    {u.email}
                    {u.isAdmin && (
                      <span className="ml-2 text-xs text-brand-500">ADMIN</span>
                    )}
                  </td>
                  <td className="py-3 px-3 font-mono text-xs text-slate-400">
                    {u.walletAddress ?? '—'}
                  </td>
                  <td className="py-3 px-3 font-mono text-xs text-slate-400">
                    {u.referralCode}
                  </td>
                  <td className="py-3 px-3 text-right font-semibold text-brand-500">
                    {u.balance.toFixed(2)}
                  </td>
                  <td className="py-3 px-3 text-right">{u.investmentCount}</td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => {
                        setCreditUser(u);
                        setCreditAmount('');
                        setCreditNote('');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-xs font-medium"
                    >
                      Credit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {tab === 'wallets' && (
        <section className="grid md:grid-cols-2 gap-4">
          {wallets.map((w) => (
            <div
              key={w.id}
              className="bg-white/5 border border-white/10 rounded-xl p-5"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-brand-500 font-semibold">{w.coin}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {w.network ?? '—'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditWallet(w);
                    setEditAddress(w.address);
                    setEditNetwork(w.network ?? '');
                  }}
                  className="text-xs px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5"
                >
                  Edit
                </button>
              </div>
              <p className="font-mono text-xs mt-3 text-slate-300 break-all">
                {w.address}
              </p>
            </div>
          ))}
        </section>
      )}

      {tab === 'withdrawals' && (
        <section>
          {pending.length === 0 ? (
            <p className="text-slate-400 text-sm">No pending withdrawals.</p>
          ) : (
            <div className="space-y-3">
              {pending.map((w) => (
                <div
                  key={w.id}
                  className="bg-white/5 border border-white/10 rounded-xl p-5 flex justify-between items-center"
                >
                  <div>
                    <p className="font-semibold">{w.user.email}</p>
                    <p className="text-sm text-slate-400">
                      Amount: {w.amount} · {new Date(w.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => review(w.id, 'APPROVE')}
                      className="px-3 py-1.5 rounded-lg bg-green-500 hover:bg-green-600 text-xs font-medium"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => review(w.id, 'REJECT')}
                      className="px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-xs font-medium"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Credit modal */}
      {creditUser && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center px-6 z-50"
          onClick={() => setCreditUser(null)}
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={submitCredit}
            className="w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl p-6 space-y-4"
          >
            <h3 className="text-xl font-bold">Credit {creditUser.email}</h3>
            <div className="space-y-1">
              <label className="text-sm text-slate-400">Amount</label>
              <input
                type="number"
                required
                value={creditAmount}
                onChange={(e) => setCreditAmount(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-slate-950 border border-white/10 focus:border-brand-500 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-slate-400">Note</label>
              <input
                type="text"
                value={creditNote}
                onChange={(e) => setCreditNote(e.target.value)}
                placeholder="e.g., BTC deposit txid"
                className="w-full px-4 py-3 rounded-lg bg-slate-950 border border-white/10 focus:border-brand-500 outline-none"
              />
            </div>
            {creditError && (
              <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {creditError}
              </p>
            )}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCreditUser(null)}
                className="flex-1 py-3 rounded-lg border border-white/10 hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 rounded-lg bg-brand-500 hover:bg-brand-600 font-medium"
              >
                Credit
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit wallet modal */}
      {editWallet && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center px-6 z-50"
          onClick={() => setEditWallet(null)}
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={submitWallet}
            className="w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl p-6 space-y-4"
          >
            <h3 className="text-xl font-bold">Edit {editWallet.coin} address</h3>
            <div className="space-y-1">
              <label className="text-sm text-slate-400">Address</label>
              <input
                type="text"
                required
                value={editAddress}
                onChange={(e) => setEditAddress(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-slate-950 border border-white/10 focus:border-brand-500 outline-none font-mono text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-slate-400">Network</label>
              <input
                type="text"
                value={editNetwork}
                onChange={(e) => setEditNetwork(e.target.value)}
                placeholder="e.g., ERC20, TRC20, Solana"
                className="w-full px-4 py-3 rounded-lg bg-slate-950 border border-white/10 focus:border-brand-500 outline-none"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditWallet(null)}
                className="flex-1 py-3 rounded-lg border border-white/10 hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 rounded-lg bg-brand-500 hover:bg-brand-600 font-medium"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}