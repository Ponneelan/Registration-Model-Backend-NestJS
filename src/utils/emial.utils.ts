import { HttpStatus } from "@nestjs/common";
import { Response } from "express";
import { createTransport } from "nodemailer";
export class EmailUtils {
    transporter: any;
    constructor() {
        this.transporter = createTransport({
            service: 'gmail',
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASSWORD
            }
        });
        this.transporter.verify((err:any, success:any) => {
            if (err) {
                console.log(err);
            }
            if (success) {
                console.log('Mail Server is ready to take messages');
            }
        });
    }

     sendVerificationMail(email: string, token: string,  res: Response,) {
        const mailOptions = {
            from: process.env.MAIL_USER,
            to: email,
            subject: 'Verify your account',
            html: `<h1>Click on the link to verify your account</h1><br/> <p>${process.env.FRONT_END_URL}/verify/?token=${token}</p>`,
        };
        this.transporter.sendMail(mailOptions, (err:any, info:any) => {
            if (err) {
                console.log(err)
                res.status(HttpStatus.BAD_REQUEST).json({ 
                    status:false,
                    message: '5.something went wrong'
                });
            }
            if (info) {
                res.status(HttpStatus.OK).json({ 
                    status:true,
                    message: 'check your email to verify your account' 
                });
            }
        }
        );
    };

    sendResetPasswordMail(email: string, token: string, res: Response) {
        const mailOptions = {
            from: process.env.MAIL_USER,
            to: email,
            subject: 'Reset your password',
            html: `<h1>Click on the link to reset your password</h1><br/> <p>${process.env.FRONT_END_URL}/resetpassword/?token=${token}</p>`,
        };
        this.transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                res.status(HttpStatus.BAD_REQUEST).json({ 
                    status:false,
                    message: '2.something went wrong' 
                });
            }
            if (info) {
                res.status(HttpStatus.OK).json({ 
                    status:true,
                    message: 'check your email to reset your password' 
                });
            }
        }
        );
    }


}