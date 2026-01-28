import { Test, TestingModule } from '@nestjs/testing';
import { DataSourceApiService } from './data_source_api.service';

describe('DataSourceApiService', () => {
  let service: DataSourceApiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DataSourceApiService],
    }).compile();

    service = module.get<DataSourceApiService>(DataSourceApiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
