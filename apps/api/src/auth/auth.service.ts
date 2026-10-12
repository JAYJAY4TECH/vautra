import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { nanoid } from 'nanoid';
import { PrismaService } from '../prisma/prisma.service';
import { LedgerService } from '../ledger/ledger.service';

type RegisterInput = {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  referralCode?: string;
  subscribed?: boolean;
};

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private ledger: LedgerService,
  ) {}

  private code() {
    return `VLT-${nanoid(8).toUpperCase()}`;
  }

  async register(input: RegisterInput) {
    const exists = await this.prisma.user.findUnique({ where: { email: input.email } });
    if (exists) throw new ConflictException('EMAIL_TAKEN');

    const passwordHash = await argon2.hash(input.password);

    let referredById: string | undefined;
    if (input.referralCode) {
      const ref = await this.prisma.user.findUnique({ where: { referralCode: input.referralCode } });
      if (ref) referredById = ref.id;
    }

    const user = await this.prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        firstName: input.firstName ?? null,
        lastName: input.lastName ?? null,
        subscribed: input.subscribed ?? false,
        referralCode: this.code(),
        referredById,
        wallet: { create: { address: `VLT-${nanoid(10).toUpperCase()}` } },
      },
    });

    return this.issue(user.id, user.email, user.role);
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('INVALID_CREDENTIALS');

    const ok = await argon2.verify(user.passwordHash, password);
    if (!ok) throw new UnauthorizedException('INVALID_CREDENTIALS');

    return this.issue(user.id, user.email, user.role);
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { wallet: true },
    });
    if (!user) throw new UnauthorizedException('USER_NOT_FOUND');

    const balance = await this.ledger.balance(userId);

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      referralCode: user.referralCode,
      walletAddress: user.wallet?.address,
      isAdmin: user.isAdmin,
      balance: Number(balance),
    };
  }

  private issue(sub: string, email: string, role: string) {
    const accessToken = this.jwt.sign({ sub, email, role });
    return { accessToken, user: { id: sub, email, role } };
  }
}