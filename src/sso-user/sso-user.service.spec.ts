import { Test, TestingModule } from '@nestjs/testing';
import { SsoUserService } from './sso-user.service';

describe('SsoUserService', () => {
  let service: SsoUserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SsoUserService],
    }).compile();

    service = module.get<SsoUserService>(SsoUserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
