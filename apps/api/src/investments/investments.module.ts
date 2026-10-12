import { Module } from '@nestjs/common';
import { InvestmentsService } from './investments.service';
import { InvestmentsController } from './investments.controller';

@Module({
  providers: [InvestmentsService],
  controllers: [InvestmentsController],
})
export class InvestmentsModule {}