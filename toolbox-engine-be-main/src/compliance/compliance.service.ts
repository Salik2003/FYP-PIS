import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateComplianceDto } from './dto/create-compliance.dto';

@Injectable()
export class ComplianceService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(sku?: string) {
    return this.prisma.complianceRecord.findMany({
      where: sku ? { productSku: sku } : undefined,
      orderBy: { auditDate: 'desc' },
    });
  }

  create(dto: CreateComplianceDto) {
    return this.prisma.complianceRecord.create({
      data: {
        ...dto,
        auditDate: dto.auditDate ? new Date(dto.auditDate) : new Date(),
        nextAudit: dto.nextAudit ? new Date(dto.nextAudit) : null,
        auditedBy: dto.auditedBy ?? 'System',
      },
    });
  }

  async getStats() {
    const [compliant, underReview, nonCompliant] = await Promise.all([
      this.prisma.complianceRecord.count({ where: { status: 'COMPLIANT' } }),
      this.prisma.complianceRecord.count({ where: { status: 'UNDER_REVIEW' } }),
      this.prisma.complianceRecord.count({ where: { status: 'NON_COMPLIANT' } }),
    ]);
    return { compliant, underReview, nonCompliant, total: compliant + underReview + nonCompliant };
  }
}
