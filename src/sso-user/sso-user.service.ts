import { Injectable } from '@nestjs/common';
import { CreateSsoUserDto } from './dto/create-sso-user.dto';
import { UpdateSsoUserDto } from './dto/update-sso-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { SsoUser } from './entities/sso-user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SsoUserService {
  constructor(@InjectRepository(SsoUser) private ssoUser:Repository<SsoUser>){}
  async create(createSsouserDto: any) {
    await this.ssoUser.save(createSsouserDto);
  }

  async getByMail(mail:string){
    return await this.ssoUser.find({select:['id','name','email','isActive','subId',],where:{email:mail}});
  }
}
