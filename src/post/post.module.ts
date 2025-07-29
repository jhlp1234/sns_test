import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { User } from 'src/user/entities/user.entity';
import { PostUserLike } from './entities/postUserLike.entity';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import {join} from 'path';
import {v4} from 'uuid';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, User, PostUserLike,]),
    MulterModule.register({
      storage: diskStorage({
        destination: join(process.cwd(), 'public', 'post'),
        filename: (req, file, cb) => {
          cb(null, `${v4()}_${Date.now()}.mp4`)
        }
      }),
    }),
  ],
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule {}
