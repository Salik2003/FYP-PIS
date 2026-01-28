import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNumber } from "class-validator";

export class DataSourceEntityQuery {
    @ApiProperty({
        description: 'The ID of the data source',
        required: true,
        type: Number,
    })
    @Transform(({ value }) => parseInt(value, 10))
    @IsNumber()
    dataSourceId: number;
}

export class DataSourceEntitySyncRequest {
    @ApiProperty({
        description: 'The ID of the data source',
        required: true,
        type: Number,
    })
    @Transform(({ value }) => parseInt(value, 10))
    @IsNumber()
    dataSourceId: number;
}