import { Module } from '@nestjs/common';
import { SsoUserService } from './sso-user.service';
import { SsoUserController } from './sso-user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SsoUser } from './entities/sso-user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SsoUser]),
  ],
  controllers: [SsoUserController],
  providers: [SsoUserService]
})
export class SsoUserModule {}
