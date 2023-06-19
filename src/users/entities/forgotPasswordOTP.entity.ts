import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class ForgotPasswordOtp{
    @PrimaryGeneratedColumn()
    id:number;

    @Column({nullable:false})
    email:string;

    @Column({nullable:false})
    otp:number;

    @Column()
    exparyIn:string;

    @Column({default:false})
    isUsed:boolean;

    @CreateDateColumn()
    createdAt:Date;

    @Column({nullable:true})
    createdBy:number;

    @UpdateDateColumn()
    updatedAt:Date;

    @Column({nullable:true})
    updatedBy:number;

    @DeleteDateColumn()
    deletedAt:Date;

    @Column({nullable:true})
    deletedBy:number;
}