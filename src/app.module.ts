import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { SsoUserModule } from './sso-user/sso-user.module';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot({
      ttl:60,
      limit:10,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      database: process.env.DATABASE_NAME,
      host: process.env.DATABASE_HOST,
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      port: 3306,
      entities: [],
      // synchronize: true,
      autoLoadEntities: true,
    }),
    UsersModule,
    SsoUserModule,

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
