import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { LedgerService } from '../ledger/ledger.service';

@Injectable()
export class AccrualService {
  private readonly logger = new Logger(AccrualService.name);
  private running = false;

  constructor(private prisma: PrismaService, private ledger: LedgerService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async accrue() {
    if (this.running) return;
    this.running = true;

    try {
      const active = await this.prisma.investment.findMany({
        where: { status: 'ACTIVE', maturesAt: { gt: new Date() } },
      });

      for (const inv of active) {
        const hourlyRate = Number(inv.rateSnapshot) / 100 / 24;
        const gain = Number(inv.principal) * hourlyRate;
        if (gain <= 0) continue;

        await this.prisma.$transaction(async (tx) => {
          await tx.investment.update({
            where: { id: inv.id },
            data: { accrued: { increment: gain } },
          });
          await this.ledger.post(tx, inv.userId, 'ACCRUAL', gain, { ref: inv.id });
        });
      }

      await this.prisma.investment.updateMany({
        where: { status: 'ACTIVE', maturesAt: { lte: new Date() } },
        data: { status: 'MATURED' },
      });

      this.logger.log(`Accrued ${active.length} investments`);
    } catch (e) {
      this.logger.error('Accrual failed', e as Error);
    } finally {
      this.running = false;
    }
  }
}