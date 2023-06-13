import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

// class with id name email, password isActive, createdAt , updatedAt, deletedAt , createdById, updatedById, deletedById ad use matched Decorators
@Entity()
export class Users {

    @PrimaryGeneratedColumn()
    id:number;

    @Column()
    name:string;

    @Column({unique:true})
    email:string;

    @Column()
    password:string;

    @Column({default:true})
    isActive:boolean;

    @Column({default:false})
    isVerified:boolean

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

    @Column({default:false})
    isBlocked:boolean;

    @Column({ nullable: true })
    blockedTime:string;

    @Column({default:0})
    unAuthorizedCount:number; 

    
}
