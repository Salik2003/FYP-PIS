import { Body, Controller, Get, HttpCode, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { EntityService } from './entity.service';
import { DataSourceEntityQuery, DataSourceEntitySyncRequest } from 'src/dto/data_source_entities.dto';

@ApiTags('Data Source Entities')
@Controller('data_source_entities')
@UseGuards(JwtAuthGuard) // Protects all routes in this controller
@ApiBearerAuth()
export class EntityController {
    constructor(private readonly service: EntityService) { }

    @Get()
    async getAll(@Query() query: DataSourceEntityQuery) {
        return await this.service.loadAllEntities(query.dataSourceId);
    }

    @Get("/:id")
    async get(@Param('id', ParseIntPipe) entityId: number) {
        return await this.service.findById(entityId);
    }

    @Post("/push")
    async pushEntities(@Body() body: { dataSourceId: number, entities: any[] }) {
        await this.service.saveEntities(body.dataSourceId, body.entities);
        return { message: 'Entities pushed successfully' };
    }

    @Post("/sync")
    async sync(@Body() body: DataSourceEntitySyncRequest) {
        return await this.service.sync(body.dataSourceId);
    }

    @Post(":id/move-down")
    @HttpCode(200)
    async moveDown(@Param('id', ParseIntPipe) entityId: number) {
        return await this.service.moveDown(entityId);
    }

    @Post(":id/move-up")
    @HttpCode(200)
    async moveUp(@Param('id', ParseIntPipe) entityId: number) {
        return await this.service.moveUp(entityId);
    }

    @Post(":id/move-field-down")
    @HttpCode(200)
    async moveFieldDown(@Param('id', ParseIntPipe) fieldId: number) {
        return await this.service.moveFieldDown(fieldId);
    }

    @Post(":id/move-field-up")
    @HttpCode(200)
    async moveFieldUp(@Param('id', ParseIntPipe) fieldId: number) {
        return await this.service.moveFieldUp(fieldId);
    }
}
