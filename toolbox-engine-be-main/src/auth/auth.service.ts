import { Injectable, Logger, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);
  private prisma = new PrismaClient();

  constructor(private jwtService: JwtService) {}

  async login(username: string, password: string): Promise<{ access_token: string }> {
    const user = await this.prisma.user.findUnique({ where: { username } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    const token = this.jwtService.sign({ username });
    return { access_token: token };
  }

  async onModuleInit() {
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const hashedPassword = bcrypt.hashSync(adminPassword, 10);
    await this.prisma.user.upsert({
      where: { username: adminUsername },
      update: {
        password: hashedPassword,
      },
      create: {
        username: adminUsername,
        password: hashedPassword,
      },
    });
    this.logger.log(`Admin user created with username: ${adminUsername}`);
  }
}
