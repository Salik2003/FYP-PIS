import { IsString, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateComplianceDto {
  @ApiProperty() @IsString() productSku: string;
  @ApiProperty() @IsString() productName: string;
  @ApiProperty() @IsString() regulation: string;
  @ApiProperty({ enum: ['COMPLIANT', 'UNDER_REVIEW', 'NON_COMPLIANT'] })
  @IsString() status: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() auditDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() nextAudit?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() auditedBy?: string;
}
