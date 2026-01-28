// inventory.model.ts
import { Field, Int, ObjectType, InputType } from '@nestjs/graphql';
import { IsString, IsOptional, IsInt, IsBoolean, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';

@ObjectType()
export class Inventory {
  @Field() sku!: string;
  @Field() locationName!: string;
  @Field() locationId!: string;
  @Field() inventoryItemId!: string;
  @Field(() => Int) quantity!: number;
}

@InputType()
export class InventoryPostInput {
  @Field()
  @IsString()
  sku!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  locationName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  locationId?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  quantity?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  reason?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl({ require_tld: false }, { message: 'referenceDocumentUri must be a URL or URI' })
  referenceDocumentUri?: string;

  @Field({ nullable: true })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  compareQuantity?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  ignoreCompareQuantity?: boolean;
}
