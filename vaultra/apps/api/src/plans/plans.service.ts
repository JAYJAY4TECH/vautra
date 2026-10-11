import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PlansService {
  constructor(private prisma: PrismaService) {}

  list() {
    return this.prisma.plan.findMany({
      where: { active: true },
      orderBy: { tier: 'asc' },
    });
  }
}