import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Res, HttpStatus, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import e, { Request, Response } from 'express';
import { Users } from './entities/user.entity';
import { hashSync, compareSync } from "bcrypt";
import { verify, sign } from "jsonwebtoken";
import { EmailUtils } from 'src/utils/emial.utils';
import { ILoginPayload } from 'src/utils/interfaces';
import { time } from 'console';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService, private helper: EmailUtils) { }

  @Post('signup')
  async create(@Body() createUserDto: CreateUserDto, @Req() req: Request, @Res() res: Response) {
    try {
      const existUser: Users = await this.usersService.getByEmail(createUserDto.email);
      if (existUser) {
        console.log('1');
        if (existUser.isVerified) {
          res.status(HttpStatus.BAD_REQUEST).json({
            status: false,
            message: "1.some thing went wrong"
          });
        } else {
          const token = sign({ email: existUser.email }, process.env.SECRET_KEY, { expiresIn: '30m' })
          this.helper.sendVerificationMail(existUser.email, token, res);
          res.status(HttpStatus.OK).json({
            status: true,
            message: "Verification mail sent to user"
          })
        }
      } else {
        const token = sign({ email: createUserDto.email }, process.env.SECRET_KEY, { expiresIn: '30m' })
        const hashPassword = hashSync(createUserDto.password, 10)
        createUserDto.password = hashPassword
        await this.usersService.create(createUserDto);
        this.helper.sendVerificationMail(createUserDto.email, token, res);
        res.status(HttpStatus.OK).json({
          status: true,
          message: "Verification mail sent to user"
        });
      }
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).json({
        status: false,
        message: "2.some thisng went wrong"
      });
    }
  }

  @Post('verify')
  async verify(@Query('token') token: string, @Req() req: Request, @Res() res: Response) {
    console.log(token);
    try {
      if (token && token !== null && token !== undefined && token !== '') {
        let jwtPayload: any;
        console.log('here');
        try {
          jwtPayload = verify(token, process.env.SECRET_KEY);
        } catch (error) {
          res.status(HttpStatus.BAD_REQUEST).json({
            status: false,
            message: "link expairy"
          });
          return;
        }
        const user = await this.usersService.getByEmail(jwtPayload.email);
        console.log('user', user);
        if (!user.isVerified) {
          await this.usersService.verifyUser(jwtPayload.email);
          res.status(HttpStatus.OK).json({
            status: true,
            message: "user verified"
          });
        } else {
          res.status(HttpStatus.BAD_REQUEST).json({
            status: false,
            message: "already verified"
          });
          return;
        }

      } else {
        res.status(HttpStatus.BAD_REQUEST).json({
          status: false,
          message: "4.some thisng went wrong"
        });
        return;
      }
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).json({
        status: false,
        message: "5.some thisng went wrong"
      });
      return;
    }
  }

  @Post('login')
  async login(@Body() payload: ILoginPayload, @Req() req: Request, @Res() res: Response) {
    try {
      const { email, password } = payload;
      if ((email && email !== null && email !== undefined && email !== '') && (password && password !== null && password !== undefined && password !== '')) {
        const existUser: any = await this.usersService.getByEmail(email);
        if (existUser) {
          console.log(existUser.isBlocked,'.........',existUser.blockedTime);
          if (existUser.isBlocked && existUser.blockTime !== null) {
            const blockDurationHours = 1; // 3 hours
            let timespamp = +existUser.blockedTime + blockDurationHours *60 * 1000; 
            const blockEndTime = new Date(timespamp);  
            console.log("check",blockEndTime);
                      
            const currentTime = new Date();
            console.log('current time: ',currentTime,'\n','blocked end time : ',blockEndTime);
            if(currentTime > blockEndTime){
              await this.usersService.unBlockUser(existUser.email);
            }else{
              res.status(HttpStatus.BAD_REQUEST).json({
                status: true,
                message: "Your Account has been blocked"
              })
              return;
            } 
          }
          if (!existUser.isVerified) {
            const token = sign({ id: existUser.id, email: existUser.email }, process.env.SECRET_KEY, { expiresIn: '30m' })
            this.helper.sendVerificationMail(existUser.email, token, res);
            res.status(HttpStatus.OK).json({
              status: true,
              message: "Verification mail sent to user"
            });
          } else {
            let isMatch: boolean = compareSync(password, existUser.password);
            if (isMatch) {
              const loginToken = sign({ id: existUser.id, email: existUser.email }, process.env.SECRET_KEY, { expiresIn: '30m' });
              await this.usersService.unBlockUser(existUser.email);
              res.status(HttpStatus.OK).json({
                status: true,
                message: "login successfully",
                token: loginToken,
              });
            } else {
              const checkuser: any = await this.usersService.getByEmail(email);
              this.usersService.countUnauthoriedLogin(email,checkuser.unAuthorizedCount+1);
              if(checkuser.unAuthorizedCount+1 >= 3){
                this.usersService.blockUser(email);
                res.status(HttpStatus.BAD_REQUEST).json({
                  status: false,
                  message: "User Blocked",
                });
                return;
              }
              res.status(HttpStatus.BAD_REQUEST).json({
                status: false,
                message: "1.some thing went wrong",
              });
            }
          }
        } else {
          res.status(HttpStatus.BAD_REQUEST).json({
            status: false,
            message: "2.some thing went wrong",
          });
        }
      } else {
        res.status(HttpStatus.BAD_REQUEST).json({
          status: false,
          message: "3.some thing went wrong"
        });
      }
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).json({
        status: false,
        message: "4.some thing went wrong"
      });
    }
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
