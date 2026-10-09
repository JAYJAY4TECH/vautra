import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LedgerService } from '../ledger/ledger.service';

@Injectable()
export class WithdrawalsService {
  constructor(private prisma: PrismaService, private ledger: LedgerService) {}

  async eligibility(userId: string) {
    const investments = await this.prisma.investment.findMany({
      where: { userId },
      include: { plan: true },
    });

    if (investments.length === 0) {
      return { canWithdraw: false, reason: 'NO_INVESTMENT' };
    }

    const totalPrincipal = investments.reduce((s, i) => s + Number(i.principal), 0);
    const minThreshold = Math.max(...investments.map((i) => Number(i.plan.minWithdraw)));

    if (totalPrincipal < minThreshold) {
      return {
        canWithdraw: false,
        reason: 'BELOW_THRESHOLD',
        needed: minThreshold - totalPrincipal,
      };
    }

    const stillLocked = investments.filter(
      (i) => i.status === 'ACTIVE' && i.maturesAt > new Date(),
    );
    if (stillLocked.length > 0) {
      return { canWithdraw: false, reason: 'LOCKED', count: stillLocked.length };
    }

    const balance = await this.ledger.balance(userId);
    return { canWithdraw: true, balance: Number(balance) };
  }

  async request(userId: string, amount: number) {
    const check = await this.eligibility(userId);
    if (!check.canWithdraw) throw new BadRequestException(check.reason);

    const balance = await this.ledger.balance(userId);
    if (amount > Number(balance)) throw new BadRequestException('INSUFFICIENT_FUNDS');

    return this.prisma.$transaction(async (tx) => {
      await this.ledger.post(tx, userId, 'WITHDRAWAL', -amount);
      return tx.withdrawal.create({ data: { userId, amount } });
    });
  }

  async mine(userId: string) {
    return this.prisma.withdrawal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}