import { User } from "src/user/entities/user.entity";
import { Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { Post } from "./post.entity";

@Entity()
export class PostUserLike {
    @PrimaryColumn({type: 'int8', name: 'userId'})
    @ManyToOne(() => User, user => user.likedPost)
    user: User;

    @PrimaryColumn({type: 'int8', name: 'postId'})
    @ManyToOne(() => Post, post => post.likedUsers)
    post: Post;
}