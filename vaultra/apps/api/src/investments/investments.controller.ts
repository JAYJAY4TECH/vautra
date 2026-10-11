import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InvestmentsService } from './investments.service';

class CreateInvestmentDto {
  planId!: string;
  amount!: number;
}

@UseGuards(AuthGuard('jwt'))
@Controller('investments')
export class InvestmentsController {
  constructor(private inv: InvestmentsService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateInvestmentDto) {
    return this.inv.create(req.user.id, dto.planId, dto.amount);
  }

  @Get()
  mine(@Req() req: any) {
    return this.inv.mine(req.user.id);
  }
}