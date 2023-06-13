import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(Users) private usersRepository: Repository<Users>) { }

  async create(createUserDto: CreateUserDto) {
    await this.usersRepository.save(createUserDto);
  }

  async findAll() {
    return await this.usersRepository.find();
  }

  async findOne(id: number) {
    return await this.usersRepository.findOne({ where: { id:id } });
  }
  async getByEmail(email: string) {
    return await this.usersRepository.findOne({ where: { email: email } });
  }
  async unBlockUser(email:string){
    await this.usersRepository.update({email},{isBlocked: false,blockedTime:null,unAuthorizedCount:0})
  }
  async blockUser(email:string){
    await this.usersRepository.update({email},{isBlocked:true,blockedTime:Date.now().toString()});
  }
  async countUnauthoriedLogin(email:string,unAuthorizedCount:number){
    await this.usersRepository.update({email},{unAuthorizedCount});
  }
  async update(id: number, updateUserDto: UpdateUserDto) {
    await this.usersRepository.update({ id }, updateUserDto);
  }

  async verifyUser(email:string){
    await this.usersRepository.update({email},{isVerified:true})
  }
  async remove(id: number) {
    await this.usersRepository.softDelete({ id });
  }
}
