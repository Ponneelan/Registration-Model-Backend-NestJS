import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from './entities/user.entity';
import { EmailService } from 'src/utils/emial.service';
import { OtpService } from 'src/utils/otp/otp.service';
import { ForgotPasswordOtp } from './entities/forgotPasswordOTP.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Users,ForgotPasswordOtp]),
  ] ,
  controllers: [UsersController],
  providers: [UsersService,EmailService,OtpService]
})
export class UsersModule {}
