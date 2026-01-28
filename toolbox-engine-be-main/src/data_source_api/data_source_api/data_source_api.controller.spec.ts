import { Test, TestingModule } from '@nestjs/testing';
import { DataSourceApiController } from './data_source_api.controller';

describe('DataSourceApiController', () => {
  let controller: DataSourceApiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DataSourceApiController],
    }).compile();

    controller = module.get<DataSourceApiController>(DataSourceApiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
