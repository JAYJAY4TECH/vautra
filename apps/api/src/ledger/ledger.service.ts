import { Injectable, BadRequestException } from '@nestjs/common';
import { Prisma, LedgerType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LedgerService {
  constructor(private prisma: PrismaService) {}

  async post(
    tx: Prisma.TransactionClient,
    userId: string,
    type: LedgerType,
    amount: number | Prisma.Decimal,
    opts: { ref?: string; note?: string } = {},
  ) {
    await tx.$executeRaw`SELECT id FROM "User" WHERE id = ${userId} FOR UPDATE`;

    const last = await tx.ledgerEntry.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const prev = new Prisma.Decimal(last?.balanceAfter ?? 0);
    const delta = new Prisma.Decimal(amount);
    const balanceAfter = prev.plus(delta);

    if (balanceAfter.isNegative()) {
      throw new BadRequestException('INSUFFICIENT_FUNDS');
    }

    return tx.ledgerEntry.create({
      data: {
        userId,
        type,
        amount: delta,
        balanceAfter,
        ref: opts.ref,
        note: opts.note,
      },
    });
  }

  async balance(userId: string) {
    const last = await this.prisma.ledgerEntry.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return new Prisma.Decimal(last?.balanceAfter ?? 0);
  }

  async history(userId: string) {
    return this.prisma.ledgerEntry.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }
}