import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-8 py-6 max-w-6xl mx-auto w-full">
        <div className="text-2xl font-bold tracking-tight">
          Vault<span className="text-brand-500">ra</span>
        </div>
        <nav className="flex gap-3">
          <Link
            href="/login"
            className="px-4 py-2 rounded-lg hover:bg-white/5 transition"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 font-medium transition"
          >
            Get started
          </Link>
        </nav>
      </header>

      <section className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-3xl text-center">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight">
            Grow your stake.
            <br />
            <span className="text-brand-500">Unlock your yield.</span>
          </h1>
          <p className="mt-6 text-lg text-slate-400 max-w-2xl mx-auto">
            Tiered plans, daily accruals, and referral rewards — all in one
            dashboard. Start small, grow steady, unlock big.
          </p>
          <div className="mt-10 flex gap-4 justify-center">
            <Link
              href="/register"
              className="px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 font-medium transition"
            >
              Create account
            </Link>
            <Link
              href="/login"
              className="px-6 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      <footer className="text-center text-sm text-slate-500 py-6">
        © {new Date().getFullYear()} Vaultra
      </footer>
    </main>
  );
}