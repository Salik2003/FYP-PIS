import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNumber } from "class-validator";

export class DataSourceDataQuery {
    @ApiProperty({
        description: 'The ID of the entity',
        required: true,
        type: Number,
    })
    @Transform(({ value }) => parseInt(value, 10))
    @IsNumber()
    entityId: number;
}

export class DataSourceDataSyncRequest {
    @ApiProperty({
        description: 'The ID of the entity to sync',
        required: true,
        type: Number,
    })
    @Transform(({ value }) => parseInt(value, 10))
    @IsNumber()
    entityId: number;
}