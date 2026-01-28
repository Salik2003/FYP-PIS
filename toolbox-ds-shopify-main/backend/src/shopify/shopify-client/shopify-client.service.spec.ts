import { Test, TestingModule } from '@nestjs/testing';
import { ShopifyClientService } from './shopify-client.service';

describe('ShopifyClientService', () => {
  let service: ShopifyClientService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ShopifyClientService],
    }).compile();

    service = module.get<ShopifyClientService>(ShopifyClientService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
