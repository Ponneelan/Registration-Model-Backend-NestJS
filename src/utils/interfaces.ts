export interface IVerifyPayload {
    token: string;
}

export interface ILoginPayload{
    email:string;
    password:string,
}

export interface IFrogotPasswordBody{
    email:string,
}

export interface IMailOption{
    emailTo:string,
    subject:string,
    message:string;
}

