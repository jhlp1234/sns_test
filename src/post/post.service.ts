import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { PostUserLike } from './entities/postUserLike.entity';
import { join } from 'path';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(PostUserLike)
    private readonly postUserLikeRepository: Repository<PostUserLike>,
  ){}

  async create(createPostDto: CreatePostDto, userId: number, fileName?: string) {
    const existPost = await this.postRepository.createQueryBuilder()
    .where('"userId" = :userId', {userId})
    .andWhere('"name" = :name', {name: createPostDto.name})
    .getOne();
    if(existPost) throw new BadRequestException('같은 이름이 존재합니다');

    const user = await this.userRepository.findOne({where: {id: userId}});
    if(!user) throw new NotFoundException('없는 유저');

    return this.postRepository.save({...createPostDto, user, postPath: (!fileName ? undefined : join('public', 'post', fileName))});
  }

  findAll() {
    return this.postRepository.find();
  }

  async findOne(id: number) {
    const post = await this.postRepository.findOne({where: {id}, relations: ['user']});
    if(!post) throw new NotFoundException('없는 포스트');

    return post;
  }

  async update(id: number, updatePostDto: UpdatePostDto) {
    const post = await this.postRepository.findOne({where: {id}});
    if(!post) throw new NotFoundException('없는 포스트');

    await this.postRepository.update({id}, updatePostDto);

    return this.postRepository.findOne({where: {id}});
  }

  async remove(id: number) {
    await this.postRepository.delete(id);

    return `${id} Deleted`;
  }

  getLikedUsers(postId: number){
    return this.postUserLikeRepository.createQueryBuilder('pul')
      .select(['pul.user'])
      .leftJoinAndSelect('pul.user', 'user')
      .where('"postId" = :postId', {postId})
      .getMany();
  }

  async doLike(userId: number, postId: number){
    const user = await this.userRepository.findOne({where: {id: userId}});
    if(!user) throw new NotFoundException('없는 유저');

    const post = await this.postRepository.findOne({where: {id: postId}});
    if(!post) throw new NotFoundException('없는 포스트');

    return this.postUserLikeRepository.save({user, post});
  }

  async disLike(userId: number, postId: number){
    await this.postUserLikeRepository.createQueryBuilder()
      .delete()
      .where('"userId" = :userId', {userId})
      .andWhere('"postId" = :postId', {postId})
      .execute();

    return `${userId} disliked ${postId}`;
  }
}
