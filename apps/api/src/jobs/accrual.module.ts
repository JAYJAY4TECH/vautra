import { Module } from '@nestjs/common';
import { AccrualService } from './accrual.service';

@Module({
  providers: [AccrualService],
})
export class AccrualModule {}