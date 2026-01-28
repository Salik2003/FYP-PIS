import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { DataSourcePullCreateRequest, DataSourcePullQuery } from 'src/dto/data_source_pull.dto';
import { PullService } from './pull.service';

@ApiTags('Data Source Pulls')
@Controller('data_source_pulls')
@UseGuards(JwtAuthGuard) // Protects all routes in this controller
@ApiBearerAuth()
export class PullController {
    constructor(private readonly service: PullService) { }

    @Get()
    async getAll(@Query() query: DataSourcePullQuery) {
        return await this.service.query(query);
    }

    @Get("/:id")
    async getById(@Param("id") id: number) {
        return await this.service.findById(id);
    }

    @Post()
    async create(@Body() body: DataSourcePullCreateRequest) {
        return await this.service.pull(body);
    }
}
