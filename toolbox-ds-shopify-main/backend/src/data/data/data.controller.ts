import { Controller, Get, Logger, Param, Query } from '@nestjs/common';
import { EntityRegistry } from '../entity.registry';
import { ApiHeader } from '@nestjs/swagger';

@ApiHeader({
  name: 'api-key',
  description: 'API Key for authentication',
  required: true,
})
@Controller('data/:type')
export class DataController {
  private readonly logger = new Logger(DataController.name);
  constructor(private readonly entityRegistry: EntityRegistry) { }

  @Get()
  async getData(@Param('type') type: string, @Query() query: any) {
    const service = this.entityRegistry.getService(type);
    if (query && Object.keys(query).length > 0) {
      this.logger.log(`Fetching data for type: ${type} with query: ${JSON.stringify(query)}`);
      return service.findByPrimaryKey(query);
    }
    return service.findAll();
  }
}
