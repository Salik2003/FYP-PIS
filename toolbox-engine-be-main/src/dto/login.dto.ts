import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class LoginDto {
    @ApiProperty({
        description: 'The username of the user',
        example: 'john_doe',
    })
    @IsString()
    username: string;

    @ApiProperty({
        description: 'The password of the user',
        example: 'securePassword123',
    })
    @IsString()
    password: string;
}
