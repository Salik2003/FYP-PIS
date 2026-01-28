import { 
  Controller, Get, Post, Put, Param, Body, Headers, UseGuards 
} from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { DataSourceGuard } from 'src/auth/data-source.guard';
import { DataSourceService } from 'src/data_source/data_source/data_source.service';
import { CreateDataSourceDto } from 'src/dto/create-data-source.dto'; 
import { Prisma, DataSource, DataSourceEntity } from '@prisma/client';


@ApiTags('Data Source API')
@Controller('data_source_api')
@UseGuards(DataSourceGuard) // Protects all routes in this controller
@ApiSecurity('x-api-key')
export class DataSourceApiController {
  constructor(private readonly dataSourceService: DataSourceService) {}

  // ✅ HEALTH CHECK
  @Get('/health')
  async getHealth(@Headers('x-api-key') apiKey: string) {
    const dataSource = await this.dataSourceService.findByEngineApiKey(apiKey);
    if (!dataSource) {
      return { status: 'error', message: 'Invalid API key' };
    }
    return { 
      status: 'ok', 
      message: 'Toolbox Engine is healthy', 
      id: dataSource.id, 
      name: dataSource.name, 
      active: dataSource.active 
    };
  }

  @Post()
  async createDataSource(@Body() createDto: CreateDataSourceDto) {
    const newDataSource = await this.dataSourceService.create(createDto);
    return { status: 'ok', message: 'Data Source created', data: newDataSource };
  }

  @Get()
  async getAllDataSources() {
    const dataSources = await this.dataSourceService.findAll();
    return { status: 'ok', data: dataSources };
  }

  @Put()
  async updateDataSource(
    @Param('id') id: number, 
    @Body() updateDto: CreateDataSourceDto
  ) {
    const updated = await this.dataSourceService.update(id, updateDto);
    if (!updated) {
      return { status: 'error', message: 'Data Source not found or update failed' };
    }
    return { status: 'ok', message: 'Data Source updated', data: updated };
  }
}
