import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const plans = [
    { name: 'Starter', tier: 1, ratePerDay: 0.5, lockDays: 30, minDeposit: 1000, minWithdraw: 5000, referralPct: 5 },
    { name: 'Silver',  tier: 2, ratePerDay: 0.8, lockDays: 60, minDeposit: 10000, minWithdraw: 20000, referralPct: 8 },
    { name: 'Gold',    tier: 3, ratePerDay: 1.2, lockDays: 90, minDeposit: 50000, minWithdraw: 100000, referralPct: 12 },
  ];

  for (const p of plans) {
    await prisma.plan.upsert({ where: { tier: p.tier }, update: p, create: p });
  }

  const wallets = [
    { coin: 'BTC',  address: 'REPLACE_WITH_YOUR_BTC_ADDRESS', network: 'Bitcoin' },
    { coin: 'SOL',  address: 'JC64d1kgy9KFr9GvYck4KcXZM3N1QeUChxWSLpzDz33o', network: 'Solana' },
    { coin: 'ETH',  address: 'REPLACE_WITH_YOUR_ETH_ADDRESS', network: 'ERC20' },
    { coin: 'USDT', address: 'REPLACE_WITH_YOUR_USDT_ADDRESS', network: 'TRC20' },
  ];

  for (const w of wallets) {
    await prisma.walletAddress.upsert({ where: { coin: w.coin }, update: w, create: w });
  }

  console.log('✅ Seeded plans and wallet addresses');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());