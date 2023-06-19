import { Test, TestingModule } from '@nestjs/testing';
import { SsoUserController } from './sso-user.controller';
import { SsoUserService } from './sso-user.service';

describe('SsoUserController', () => {
  let controller: SsoUserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SsoUserController],
      providers: [SsoUserService],
    }).compile();

    controller = module.get<SsoUserController>(SsoUserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
