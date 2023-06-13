import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from './entities/user.entity';
import { EmailUtils } from 'src/utils/emial.utils';

@Module({
  imports: [
    TypeOrmModule.forFeature([Users]),
  ] ,
  controllers: [UsersController],
  providers: [UsersService,EmailUtils]
})
export class UsersModule {}
