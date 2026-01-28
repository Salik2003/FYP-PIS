import { Test, TestingModule } from '@nestjs/testing';
import { PullService } from './pull.service';

describe('PullService', () => {
  let service: PullService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PullService],
    }).compile();

    service = module.get<PullService>(PullService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
