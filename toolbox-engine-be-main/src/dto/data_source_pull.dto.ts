import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsBoolean, IsNumber, IsString } from "class-validator";
import { DataSourcePullTargetType } from "@prisma/client";

export class DataSourcePullQuery {
    @ApiProperty({
        description: 'The type of the target',
        required: true,
        type: String,
    })
    @IsString()
    targetType: DataSourcePullTargetType;

    @ApiProperty({
        description: 'The ID of the target',
        required: true,
        type: Number,
    })
    @Transform(({ value }) => parseInt(value, 10))
    @IsNumber()
    targetId: number;

    @ApiProperty({
        description: 'Whether to get the last pull',
        required: false,
        type: Boolean,
    })
    @Transform(({ value }) => value === 'true')
    @IsBoolean()
    last?: boolean;

    @ApiProperty({  
        description: 'Whether to include the data count',
        required: false,
        type: Boolean,
    })
    @Transform(({ value }) => value === 'true')
    @IsBoolean()
    includeDataCount?: boolean;
}

export class DataSourcePullCreateRequest {
    @ApiProperty({
        description: 'The type of the target',
        required: true,
        type: String,
    })
    @IsString()
    targetType: DataSourcePullTargetType;

    @ApiProperty({
        description: 'The ID of the target',
        required: true,
        type: Number,
    })
    @Transform(({ value }) => parseInt(value, 10))
    @IsNumber()
    targetId: number;
}