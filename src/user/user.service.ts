import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Follow } from './entities/follow.entity';
import { PostUserLike } from 'src/post/entities/postUserLike.entity';
import { join } from 'path';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Follow)
    private readonly followRepository: Repository<Follow>,
    @InjectRepository(PostUserLike)
    private readonly postUserLikeRepository: Repository<PostUserLike>,
  ){}

  async create(createUserDto: CreateUserDto) {
    const existUser = await this.userRepository.findOne({where: {name: createUserDto.name}});
    if(existUser) throw new BadRequestException('이미 있는 유저');

    const hashed = await bcrypt.hash(createUserDto.password, 10);

    return this.userRepository.save({...createUserDto, password: hashed});
  }

  findAll() {
    return this.userRepository.find();
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOne({where: {id}});
    if(!user) throw new NotFoundException('없는 유저');

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOne({where: {id}});
    if(!user) throw new NotFoundException('없는 유저');

    await this.userRepository.update({id}, updateUserDto);

    return this.userRepository.findOne({where: {id}});
  }

  async remove(id: number) {
    await this.userRepository.delete(id);

    return id;
  }

  async getFollowing(userId: number, cursor?: string){
    const qb = await this.followRepository.createQueryBuilder('follow')
      .leftJoinAndSelect('follow.following', 'following')
      .where('"followerId" = :userId', {userId})

    if(cursor){
      const pCursor = Buffer.from(cursor, 'base64').toString('utf-8');
      const val = JSON.parse(pCursor);
      qb.andWhere(`"followingId" > :id`, {id: val.id});
    }

    const data = await qb.orderBy('follow.following', 'ASC')
      .take(2)
      .getMany();

    let nextCursor = data.length === 0 ? null : Buffer.from(JSON.stringify({id: data[data.length - 1]?.following?.id})).toString('base64');

    return {
      data,
      nextCursor,
    }
  }

  async getFollower(userId: number){
    return this.followRepository.createQueryBuilder('follow')
      .select(['follow.follower'])
      .leftJoinAndSelect('follow.follower', 'follower')
      .where('"followingId" = :userId', {userId})
      .getMany();
  }

  async doFollow(followerId: number, followingId: number){
    const follower = await this.userRepository.findOne({where: {id: followerId}});
    if(!follower) throw new NotFoundException('없는 유저');

    const following = await this.userRepository.findOne({where: {id: followingId}});
    if(!following) throw new NotFoundException('없는 팔로우 유저');

    return this.followRepository.save({follower, following});
  }
  
  async unFollow(followerId: number, followingId: number){
    await this.followRepository.createQueryBuilder()
      .delete()
      .where('"followerId" = :followerId', {followerId})
      .andWhere('"followingId" = :followingId', {followingId})
      .execute();

      return `${followerId} unfollowed ${followingId}`;
  }

  getLikedPosts(userId: number){
    return this.postUserLikeRepository.createQueryBuilder('pul')
      .select('pul.post')
      .leftJoinAndSelect('pul.post', 'post')
      .where('pul."userId" = :userId', {userId})
      .getMany();
  }

  async setProfilePic(id: number, profile: Express.Multer.File){
    //join(process.cwd(), 'public', 'profile');
    return profile.filename;
  }
}
