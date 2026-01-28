import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNotEmpty,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

export class VariantDto {
  @IsString()
  @IsNotEmpty()
  price!: string;

  @IsString()
  @IsNotEmpty()
  sku!: string;

  @IsNumber()
  inventory_quantity!: number;
}

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsOptional()
  @IsString()
  body_html?: string;

  @IsOptional()
  @IsString()
  vendor?: string;

  @IsOptional()
  @IsString()
  product_type?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VariantDto)
  variants!: VariantDto[];
}
