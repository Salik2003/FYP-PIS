import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ComplianceService } from './compliance.service';
import { CreateComplianceDto } from './dto/create-compliance.dto';

@ApiTags('compliance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('compliance')
export class ComplianceController {
  constructor(private readonly complianceService: ComplianceService) {}

  @Get()
  @ApiQuery({ name: 'sku', required: false })
  findAll(@Query('sku') sku?: string) {
    return this.complianceService.findAll(sku);
  }

  @Get('stats')
  getStats() {
    return this.complianceService.getStats();
  }

  @Post()
  create(@Body() dto: CreateComplianceDto) {
    return this.complianceService.create(dto);
  }
}
