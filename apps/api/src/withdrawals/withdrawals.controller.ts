import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { WithdrawalsService } from './withdrawals.service';

class RequestWithdrawalDto {
  amount!: number;
}

@UseGuards(AuthGuard('jwt'))
@Controller('withdrawals')
export class WithdrawalsController {
  constructor(private w: WithdrawalsService) {}

  @Get('eligibility')
  eligibility(@Req() req: any) {
    return this.w.eligibility(req.user.id);
  }

  @Get()
  mine(@Req() req: any) {
    return this.w.mine(req.user.id);
  }

  @Post()
  request(@Req() req: any, @Body() dto: RequestWithdrawalDto) {
    return this.w.request(req.user.id, dto.amount);
  }
}