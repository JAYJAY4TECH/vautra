import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LedgerService } from '../ledger/ledger.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService, private ledger: LedgerService) {}

  async listUsers() {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: { wallet: true },
    });

    const withBalance = await Promise.all(
      users.map(async (u) => {
        const balance = await this.ledger.balance(u.id);
        const investmentCount = await this.prisma.investment.count({
          where: { userId: u.id },
        });
        return {
          id: u.id,
          email: u.email,
          referralCode: u.referralCode,
          isAdmin: u.isAdmin,
          walletAddress: u.wallet?.address ?? null,
          balance: Number(balance),
          investmentCount,
          createdAt: u.createdAt,
        };
      }),
    );

    return withBalance;
  }

  async listWallets() {
    return this.prisma.walletAddress.findMany({ orderBy: { coin: 'asc' } });
  }

  async updateWallet(coin: string, address: string, network?: string) {
    return this.prisma.walletAddress.upsert({
      where: { coin },
      update: { address, network },
      create: { coin, address, network },
    });
  }

  async credit(userId: string, amount: number, note?: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('USER_NOT_FOUND');

    return this.prisma.$transaction(async (tx) => {
      return this.ledger.post(tx, userId, 'ADJUSTMENT', amount, {
        note: note ?? 'Admin credit',
      });
    });
  }

  async listPendingWithdrawals() {
    return this.prisma.withdrawal.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'asc' },
      include: { user: { select: { email: true } } },
    });
  }

  async reviewWithdrawal(id: string, action: 'APPROVE' | 'REJECT', note?: string) {
    const w = await this.prisma.withdrawal.findUnique({ where: { id } });
    if (!w) throw new NotFoundException('WITHDRAWAL_NOT_FOUND');

    const status = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';

    // If rejected, refund the amount back into the user's ledger
    if (action === 'REJECT') {
      await this.prisma.$transaction(async (tx) => {
        await this.ledger.post(tx, w.userId, 'ADJUSTMENT', Number(w.amount), {
          ref: w.id,
          note: 'Withdrawal rejected — refund',
        });
      });
    }

    return this.prisma.withdrawal.update({
      where: { id },
      data: { status, note, reviewedAt: new Date() },
    });
  }
}