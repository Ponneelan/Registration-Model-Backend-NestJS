import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, DeleteDateColumn } from 'typeorm';

@Entity()
export class SsoUser {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({unique: true})
    email: string;

    @Column({unique:true,nullable:false})
    subId:string

    @Column({default: true})
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @Column({nullable: true})
    createdBy: number;

    @CreateDateColumn()
    updatedAt: Date;

    @Column({nullable: true})
    updatedBy: number;

    @DeleteDateColumn({nullable: true})
    deletedAt: Date;

    @Column({nullable: true})
    deletedBy: number;
}
