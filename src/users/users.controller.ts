import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Res, HttpStatus, Query, UseGuards, Put } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Request, Response } from 'express';
import { Users } from './entities/user.entity';
import { hashSync, compareSync } from "bcrypt";
import { verify, sign } from "jsonwebtoken";
import { EmailService } from 'src/utils/emial.service';
import { IFrogotPasswordBody, ILoginPayload, IMailOption } from 'src/utils/interfaces';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { OtpService } from 'src/utils/otp/otp.service';
import { ForgotPasswordOtp } from './entities/forgotPasswordOTP.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService, private emailService: EmailService, private otpService: OtpService) { }

  @Post('signup')
  @UseGuards(ThrottlerGuard)
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
          this.emailService.sendVerificationMail(existUser.email, token, res);
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
        this.emailService.sendVerificationMail(createUserDto.email, token, res);
        res.status(HttpStatus.OK).json({
          status: true,
          message: "Verification mail sent to user"
        });
      }
    } catch (error) {
      console.log('signup error',error);
      res.status(HttpStatus.BAD_REQUEST).json({
        status: false,
        message: "2.some thisng went wrong"
      });
    }
  }


  @Post('verify')
  async verify(@Body() payload: any, @Req() req: Request, @Res() res: Response) {
    console.log(payload.token);
    try {
      if (payload.token && payload.token !== null && payload.token !== undefined && payload.token !== '') {
        let jwtPayload: any;
        console.log('here');
        try {
          jwtPayload = verify(payload.token, process.env.SECRET_KEY);
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
          console.log(existUser.isBlocked, '.........', existUser.blockedTime);
          if (existUser.isBlocked && existUser.blockTime !== null) {
            const blockDurationHours = 1; // 3 hours
            let timespamp = +existUser.blockedTime + blockDurationHours * 60 * 1000;
            const blockEndTime = new Date(timespamp);
            console.log("check", blockEndTime);

            const currentTime = new Date();
            console.log('current time: ', currentTime, '\n', 'blocked end time : ', blockEndTime);
            if (currentTime > blockEndTime) {
              await this.usersService.unBlockUser(existUser.email);
            } else {
              res.status(HttpStatus.BAD_REQUEST).json({
                status: true,
                message: "Your Account has been blocked"
              })
              return;
            }
          }
          if (!existUser.isVerified) {
            const token = sign({ id: existUser.id, email: existUser.email }, process.env.SECRET_KEY, { expiresIn: '30m' })
            this.emailService.sendVerificationMail(existUser.email, token, res);
            res.status(HttpStatus.BAD_REQUEST).json({
              status: false,
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
              this.usersService.countUnauthoriedLogin(email, checkuser.unAuthorizedCount + 1);
              if (checkuser.unAuthorizedCount + 1 >= 3) {
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

  @Post('forgotpassword')
  async forgotPassword(@Body() payload: IFrogotPasswordBody, @Req() req: Request, @Res() res: Response) {
    try {
      if (!payload || !payload?.email) {
        res.status(HttpStatus.BAD_REQUEST).json({
          status: false,
          message: "1.some thing went wrong"
        });
        return;
      }
      const existUser: Users = await this.usersService.getByEmail(payload.email);
      if (!existUser || !existUser?.isVerified || !existUser?.isActive) {
        res.status(HttpStatus.BAD_REQUEST).json({
          status: false,
          message: "2.some thing went wrong"
        });
        return;
      }

      const otp = this.otpService.generateOTP();
      console.log('otp.......', otp);
      const otpPlayload = {
        email: existUser.email,
        otp: otp,
        exparyIn: new Date().getTime() + 300000,
      };
      const mailOption: IMailOption = {
        emailTo: existUser.email,
        subject: 'Forgot Password OTP',
        message: `Your OTP is - ${otp}`
      }
      const token = sign({ email: existUser.email, otp: otp }, process.env.SECRET_KEY, { expiresIn: '10m' });

      await this.usersService.addOtp(otpPlayload);
      await this.emailService.sentMail(mailOption, res);

      res.status(HttpStatus.OK).json({
        status: true,
        message: "otp sent",
        token: token
      });
      return;

    } catch (error) {
      console.log(error);
      res.status(HttpStatus.BAD_REQUEST).json({
        status: false,
        message: "1.some thing went wrong"
      });
    }
  }

  @UseGuards(ThrottlerGuard)
  @Post('verifyotp')
  async verifyOTP(@Body() payload: any, @Req() req: Request, @Res() res: Response) {
    try {
      if (!payload || !payload.token || !payload.otp) {
        res.status(HttpStatus.BAD_REQUEST).json({
          status: false,
          message: "4.Some thing went wrong"
        });
        return;
      }
      let tokenPayload: any;
      try {
        tokenPayload = verify(payload.token, process.env.SECRET_KEY);
      } catch (error) {
        console.log('verify otp',error);
        res.status(HttpStatus.BAD_REQUEST).json({
          status: false,
          message: "catch error ...some thisng went worng"
        });
        return;
      }
      const existUser: Users = await this.usersService.getByEmail(tokenPayload?.email);
      if (!existUser) {
        res.status(HttpStatus.BAD_REQUEST).json({
          status: false,
          message: "3.some thing went wrong"
        });
        return;
      }
      const otpData = await this.usersService.getOTPByEmail(existUser.email, +payload.otp);
      console.log('pyaload otp............', payload.otp);
      console.log(' otpdata................', otpData);
      if (!otpData) {
        res.status(HttpStatus.BAD_REQUEST).json({
          status: false,
          message: "2.some thing went wrong"
        });
        return;
      }
      if (otpData.otp !== +payload.otp) {
        res.status(HttpStatus.BAD_REQUEST).json({
          status: false,
          message: "invalid OTP"
        });
        return;
      }
      if (!(new Date(+otpData.exparyIn).getTime() >= new Date().getTime())) {
        res.status(HttpStatus.BAD_REQUEST).json({
          status: false,
          message: "OTP Expired"
        });
        return;
      }
      await this.usersService.updateOTPToUsed(existUser.email, payload.otp);
      const token = sign({ email: existUser.email, id: existUser.id }, process.env.SECRET_KEY);
      await this.usersService.updateTokenToOtp(existUser.email, token, +payload.otp);
      res.status(HttpStatus.OK).json({
        status: true,
        token: token,
        message: "otp matched",
      });
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).json({
        status: false,
        message: "1.some thing went wrong"
      });
      return;
    }
  }

  @UseGuards(ThrottlerGuard)
  @Put('resetpassword')
  async resetPassword(@Body() payload: any, @Req() req: Request, @Res() res: Response) {
    try {
      if (!payload || !payload?.token || !payload?.password) {
        res.status(HttpStatus.BAD_REQUEST).json({
          status: false,
          message: "1.some thing went wrong"
        });
        return;
      }
      const tokenData: ForgotPasswordOtp = await this.usersService.verifyTokenIsused(payload?.token);
      if (tokenData.isTokenUsed) {
        res.status(HttpStatus.BAD_REQUEST).json({
          status: false,
          message: "5.some thisng went worng"
        });
        return;
      }
      let tokenPayload: any;
      try {
        tokenPayload = verify(payload?.token, process.env.SECRET_KEY);
      } catch (error) {
        res.status(HttpStatus.BAD_REQUEST).json({
          status: false,
          message: "2.some thing went wrong"
        });
        return;
      }
      const existUser: Users = await this.usersService.getByEmail(tokenPayload.email);

      if (!existUser) {
        res.status(HttpStatus.BAD_REQUEST).json({
          status: false,
          message: "3.some thing went wrong"
        });
        return;
      }
      const hashPassword = hashSync(payload.password, 10);
      console.log('email........', existUser.email);
      console.log('pass........', hashPassword);

      await this.usersService.updatePassword(existUser.email, hashPassword);
      res.status(HttpStatus.OK).json({
        status: true,
        message: 'Password Reset Successfull'
      });
      return;
    } catch (error) {
      console.log('reset password error........', error);
      res.status(HttpStatus.BAD_REQUEST).json({
        status: false,
        message: "4.some thing went wrong"
      });
      return;
    }
  }

  @UseGuards(ThrottlerGuard)
  @Post('resendotp')
  async resentOtp(@Body() payload: any, @Req() req: Request, @Res() res: Response) {
    try {
      if (!payload || !payload?.token) {
        res.status(HttpStatus.BAD_REQUEST).json({
          status: false,
          message: "1.some thing went wrong"
        });
        return;
      }
      let tokenPayload: any;
      try {
        tokenPayload = verify(payload?.token, process.env.SECRET_KEY);
      } catch (error) {
        res.status(HttpStatus.BAD_REQUEST).json({
          status: false,
          message: "2.some thing went wrong"
        });
        return;
      }

      const existUser: Users = await this.usersService.getByEmail(tokenPayload.email);
      if (!existUser) {
        res.status(HttpStatus.BAD_REQUEST).json({
          status: false,
          message: "3.some thing went wrong"
        });
        return;
      }
      const newOtp = this.otpService.generateOTP();
      console.log('new otp ............',newOtp);
      const mailOption: IMailOption = {
        emailTo: existUser.email,
        subject: 'Forgot Password OTP',
        message: `Your OTP is - ${newOtp}`
      }
      await this.emailService.sentMail(mailOption, res);
      await this.usersService.updateOtp(existUser.email,  newOtp);
      res.status(HttpStatus.OK).json({
        status: true,
        message: "otp sent",
      });
      return;


    } catch (error) {
      console.log('reset password error........', error);
      res.status(HttpStatus.BAD_REQUEST).json({
        status: false,
        message: "4.some thing went wrong"
      });
      return;
    }
  }
  @UseGuards(ThrottlerGuard)
  @Get('users')
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


