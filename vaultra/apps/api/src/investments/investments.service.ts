import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LedgerService } from '../ledger/ledger.service';

@Injectable()
export class InvestmentsService {
  constructor(private prisma: PrismaService, private ledger: LedgerService) {}

  async create(userId: string, planId: string, amount: number) {
    const plan = await this.prisma.plan.findUnique({ where: { id: planId } });
    if (!plan || !plan.active) throw new NotFoundException('PLAN_NOT_FOUND');
    if (amount < Number(plan.minDeposit)) {
      throw new BadRequestException('BELOW_MIN_DEPOSIT');
    }

    const maturesAt = new Date(Date.now() + plan.lockDays * 24 * 60 * 60 * 1000);

    return this.prisma.$transaction(async (tx) => {
      await this.ledger.post(tx, userId, 'DEPOSIT', -amount);

      const investment = await tx.investment.create({
        data: {
          userId,
          planId,
          principal: amount,
          rateSnapshot: plan.ratePerDay,
          maturesAt,
        },
      });

      const user = await tx.user.findUnique({ where: { id: userId } });
      if (user?.referredById) {
        const bonus = amount * (Number(plan.referralPct) / 100);
        await this.ledger.post(tx, user.referredById, 'REFERRAL', bonus, {
          ref: investment.id,
          note: `Referral bonus from ${user.email}`,
        });
      }

      return investment;
    });
  }

  async mine(userId: string) {
    return this.prisma.investment.findMany({
      where: { userId },
      orderBy: { startedAt: 'desc' },
      include: { plan: true },
    });
  }
}