import { User } from "src/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { PostUserLike } from "./postUserLike.entity";

@Entity()
export class Post {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    description: string;

    @Column({nullable: true})
    postPath: string;
    
    @CreateDateColumn()
    createdAt: Date;
    
    @UpdateDateColumn()
    updatedAt: Date;
    
    @ManyToOne(() => User, user => user.posts)
    user: User;

    @OneToMany(() => PostUserLike, pul => pul.user)
    likedUsers: PostUserLike[];
}
