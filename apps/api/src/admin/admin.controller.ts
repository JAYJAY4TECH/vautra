import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminService } from './admin.service';

function requireAdmin(req: any) {
  if (!req.user?.isAdmin) throw new ForbiddenException('ADMIN_ONLY');
}

class UpdateWalletDto {
  address!: string;
  network?: string;
}

class CreditDto {
  amount!: number;
  note?: string;
}

class ReviewDto {
  action!: 'APPROVE' | 'REJECT';
  note?: string;
}

@Controller('admin')
export class AdminController {
  constructor(private admin: AdminService) {}

  // PUBLIC — no auth needed
  @Get('wallets/public')
  publicWallets() {
    return this.admin.listWallets();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('users')
  users(@Req() req: any) {
    requireAdmin(req);
    return this.admin.listUsers();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('wallets')
  wallets(@Req() req: any) {
    requireAdmin(req);
    return this.admin.listWallets();
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('wallets/:coin')
  updateWallet(@Req() req: any, @Param('coin') coin: string, @Body() dto: UpdateWalletDto) {
    requireAdmin(req);
    return this.admin.updateWallet(coin.toUpperCase(), dto.address, dto.network);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('users/:id/credit')
  credit(@Req() req: any, @Param('id') id: string, @Body() dto: CreditDto) {
    requireAdmin(req);
    return this.admin.credit(id, dto.amount, dto.note);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('withdrawals/pending')
  pending(@Req() req: any) {
    requireAdmin(req);
    return this.admin.listPendingWithdrawals();
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('withdrawals/:id/review')
  review(@Req() req: any, @Param('id') id: string, @Body() dto: ReviewDto) {
    requireAdmin(req);
    return this.admin.reviewWithdrawal(id, dto.action, dto.note);
  }
}