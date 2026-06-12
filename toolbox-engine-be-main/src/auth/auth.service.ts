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

    const token = this.jwtService.sign({ username, role: user.role, name: user.name });
    return { access_token: token };
  }

  async onModuleInit() {
    const seedUsers = [
      { username: 'admin',      password: 'admin123',  role: 'ADMIN',      name: 'Administrator',  department: 'IT' },
      { username: 'sales',      password: 'sales123',  role: 'SALES',      name: 'Sarah Sales',    department: 'Sales' },
      { username: 'production', password: 'prod123',   role: 'PRODUCTION', name: 'Peter Production', department: 'Operations' },
      { username: 'compliance', password: 'comply123', role: 'COMPLIANCE', name: 'Claire Compliance', department: 'Legal' },
      { username: 'rd',         password: 'rd123',     role: 'R&D',        name: 'Raj Research',   department: 'R&D' },
    ];

    for (const u of seedUsers) {
      const hashed = bcrypt.hashSync(u.password, 10);
      await this.prisma.user.upsert({
        where: { username: u.username },
        update: { password: hashed, role: u.role, name: u.name, department: u.department },
        create: { username: u.username, password: hashed, role: u.role, name: u.name, department: u.department },
      });
    }
    this.logger.log('Demo users seeded: admin, sales, production, compliance, rd');
  }
}
