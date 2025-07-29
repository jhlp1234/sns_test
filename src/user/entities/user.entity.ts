import { Exclude } from "class-transformer";
import { Post } from "src/post/entities/post.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Follow } from "./follow.entity";
import { PostUserLike } from "src/post/entities/postUserLike.entity";
import { ApiHideProperty, ApiProperty } from "@nestjs/swagger";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    @Exclude()
    password: string;

    @Column()
    age: number;

    @Column()
    gender: 'male' | 'female';

    @Column({nullable: true})
    profilePic: string;

    @OneToMany(() => Post, post => post.user)
    posts: Post[];

    @OneToMany(() => Follow, follow => follow.follower)
    followers: Follow[];

    @OneToMany(() => Follow, follow => follow.following)
    followings: Follow[];

    @OneToMany(() => PostUserLike, pul => pul.post)
    likedPost: PostUserLike[];
}
