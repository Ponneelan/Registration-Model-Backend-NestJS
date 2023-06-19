import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Res, HttpStatus } from '@nestjs/common';
import { SsoUserService } from './sso-user.service';
import { CreateSsoUserDto } from './dto/create-sso-user.dto';
import { UpdateSsoUserDto } from './dto/update-sso-user.dto';
import { Request, Response } from 'express';
import { sign, verify } from 'jsonwebtoken';
import { OAuth2Client } from "google-auth-library";


@Controller('ssouser')
export class SsoUserController {
  client: OAuth2Client;
  constructor(private readonly ssoUserService: SsoUserService) {
    this.client = new OAuth2Client(process.env.CLIENT_ID);
  }

  @Post('ssologin')
  async create(@Body() token: any, @Req() req: Request, @Res() res: Response) {
    console.log('...........token ...............', token);
    try {
      if (token && token !== null) {
        const VerifyIdTokenOptions = {
          idToken: token.token,
          audience: process.env.CLIENT_ID,
          maxExpiry: 36000
        }
        this.client.verifyIdToken(VerifyIdTokenOptions, async (error, login) => {
          if (error) {
            console.log('...........invalid token...........', error);
            res.status(HttpStatus.BAD_REQUEST).json({
              status: false,
              message: 'something went wrong'
            })
          }
          if (login) {
            console.log('...............success..........', login);
            let userPayload = login.getPayload();
            const loginToken = sign({ email: userPayload.email, subId: userPayload.sub, name: userPayload.name }, process.env.SECRET_KEY, { expiresIn: "1h" });
            const user:any = await this.ssoUserService.getByMail(userPayload.email);
            console.log('.............user...............',user);
            if (!user || user.length == 0 ) {
              const newUser = {
                name:userPayload.name,
                subId:userPayload.sub,
                email:userPayload.email
              } 
              await this.ssoUserService.create(newUser)
            }
            res.status(HttpStatus.OK).json({
              status: true,
              token: loginToken,
            });
            console.log('login token ..............',loginToken);
          }
        })

      } else {
        res.status(HttpStatus.BAD_REQUEST).json({
          status: false,
          message: 'something went wrong'
        })
      }
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).json({
        status: false,
        messgae: 'smething went wrong'
      })
    }
  }
}
