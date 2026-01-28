import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail } from 'class-validator';

export class LoginOdooDto {
  @ApiProperty({
    description: 'The URL of the odoo database',
    example: 'https://odoo.example.com/data',
  })
  @IsString()
  base_url: string;

  @ApiProperty({
    description: 'The name of the database associated with the Odoo',
    example: 'my_database',
  })
  @IsString()
  db: string;

  @ApiProperty({
    description:
      'The email for authentication or contact regarding the data source',
    example: 'user@example.com',
  })
  @IsEmail()
  login: string;

  @ApiProperty({
    description: 'The password for authentication with the data source',
    example: 'mySecurePassword123',
  })
  @IsString()
  password: string;
}
