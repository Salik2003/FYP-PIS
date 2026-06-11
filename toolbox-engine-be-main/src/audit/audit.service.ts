import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(limit = 50) {
    return this.prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  log(action: string, entity: string, entityId: string, description: string, performedBy = 'system') {
    return this.prisma.auditLog.create({
      data: { action, entity, entityId, description, performedBy },
    });
  }
}
