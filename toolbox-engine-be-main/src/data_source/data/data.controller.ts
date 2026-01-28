import { Controller, Get, Query, UseGuards, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { DataSourceDataQuery } from 'src/dto/data_source_data.dto';
import { DataService } from './data.service';

@ApiTags('Data Source Data')
@Controller('data_source_data')
@UseGuards(JwtAuthGuard) // Protects all routes in this controller
@ApiBearerAuth()
export class DataController {
    constructor(private readonly service: DataService) { }

    @Post("/push/:entityId")
    async pushData(@Param('entityId', ParseIntPipe) entityId: number, @Body() body: any[]) {
        return await this.service.pushData(entityId, body);
    }
    @Get()
    async getAll(@Query() query: DataSourceDataQuery) {
        return await this.service.getByEntityId(query.entityId);
    }
}
