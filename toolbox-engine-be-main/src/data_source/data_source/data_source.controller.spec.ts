import { Test, TestingModule } from '@nestjs/testing';
import { DataSourceController } from './data_source.controller';

describe('DataSourceController', () => {
  let controller: DataSourceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DataSourceController],
    }).compile();

    controller = module.get<DataSourceController>(DataSourceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
