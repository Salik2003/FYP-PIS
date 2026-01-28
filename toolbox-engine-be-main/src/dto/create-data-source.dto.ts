import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreateDataSourceDto {
  @ApiProperty({
    description: 'The name of the data source',
    example: 'My Data Source',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'The URL of the data source',
    example: 'https://api.example.com/data',
  })
  @IsString()
  url: string;

  @ApiProperty({
    description: 'Indicates if the data source is active',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
