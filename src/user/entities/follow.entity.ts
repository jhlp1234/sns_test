import { Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { User } from "./user.entity";

@Entity()
export class Follow {
    @PrimaryColumn({type: 'int8', name: 'followerId'})
    @ManyToOne(() => User, user => user.followers)
    follower: User;

    @PrimaryColumn({type: 'int8', name: 'followingId'})
    @ManyToOne(() => User, user => user.followings)
    following: User;
}