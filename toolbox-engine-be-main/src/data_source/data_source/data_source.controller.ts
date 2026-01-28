import { Controller, Get, Param, Post, Body, Put, Delete, UseGuards, ParseIntPipe, HttpCode } from '@nestjs/common';
import { DataSourceService } from './data_source.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateDataSourceDto } from 'src/dto/create-data-source.dto';
import { EntityService } from '../entity/entity.service';

@ApiTags('Data Sources')
@Controller('data_sources')
@UseGuards(JwtAuthGuard) // Protects all routes in this controller
@ApiBearerAuth()
export class DataSourceController {
  constructor(private readonly service: DataSourceService, private readonly entityService: EntityService) {}

  @Get()
  getAll() {
    return this.service.findAll();
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.service.findById(Number(id));
  }

  @Post()
  create(@Body() dto: CreateDataSourceDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateDataSourceDto>) {
    return this.service.update(Number(id), dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(Number(id));
  }

  @Post(":id/move-down")
  @HttpCode(200)
  async moveDown(@Param('id', ParseIntPipe) dataSourceId: number) {
    return await this.service.moveDown(dataSourceId);
  }

  @Post(":id/move-up")
  @HttpCode(200)
  async moveUp(@Param('id', ParseIntPipe) dataSourceId: number) {
    return await this.service.moveUp(dataSourceId);
  }
}
