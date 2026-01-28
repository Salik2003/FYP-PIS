import { IsOptional, IsString, IsNumber } from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  id?: string | number;

  @IsOptional()
  @IsString()
  variant_id?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  bodyHtml?: string;

  @IsOptional()
  @IsString()
  body_html?: string;

  @IsOptional()
  @IsString()
  vendor?: string;

  @IsOptional()
  @IsString()
  product_type?: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsString()
  price?: string;

  @IsOptional()
  @IsNumber()
  inventory_quantity?: number;
}
