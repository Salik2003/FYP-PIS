import { Test, TestingModule } from '@nestjs/testing';
import { PullController } from './pull.controller';

describe('PullController', () => {
  let controller: PullController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PullController],
    }).compile();

    controller = module.get<PullController>(PullController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
