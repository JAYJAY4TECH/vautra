import Link from 'next/link';

export default function ComingSoonPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6">
      <Link href="/" className="text-3xl font-bold mb-8">
        Vault<span className="text-brand-500">ra</span>
      </Link>

      <div className="max-w-md text-center">
        <div className="text-6xl mb-6">🔒</div>
        <h1 className="text-3xl font-bold mb-3">Coming Soon</h1>
        <p className="text-slate-400 mb-8">
          Social sign-up is on the way. For now, use the regular signup form to
          create your Vaultra account.
        </p>

        <div className="flex gap-3 justify-center">
          <Link
            href="/register"
            className="px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 font-medium transition"
          >
            Sign up with email
          </Link>
          <Link
            href="/"
            className="px-6 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition"
          >
            Go home
          </Link>
        </div>
      </div>
    </main>
  );
}