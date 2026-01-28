import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class TestBullmqDto {
    @ApiProperty({
        description: 'Message to send',
        example: 'Hello World',
    })
    @IsString()
    message: string;
}
