import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { LedgerModule } from './ledger/ledger.module';
import { PlansModule } from './plans/plans.module';
import { InvestmentsModule } from './investments/investments.module';
import { WithdrawalsModule } from './withdrawals/withdrawals.module';
import { AccrualModule } from './jobs/accrual.module';
import { AdminModule } from './admin/admin.module';

const isServerless = process.env.VERCEL === '1';

const baseImports = [
  ConfigModule.forRoot({ isGlobal: true }),
  PrismaModule,
  AuthModule,
  LedgerModule,
  PlansModule,
  InvestmentsModule,
  WithdrawalsModule,
  AdminModule,
];

@Module({
  imports: isServerless
    ? baseImports
    : [...baseImports, ScheduleModule.forRoot(), AccrualModule],
})
export class AppModule {}
