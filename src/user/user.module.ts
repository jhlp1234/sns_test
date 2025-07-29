import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Follow } from './entities/follow.entity';
import { PostUserLike } from 'src/post/entities/postUserLike.entity';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import { v4 } from 'uuid';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Follow, PostUserLike,]),
    MulterModule.register({
      storage: diskStorage({
        destination: join(process.cwd(), 'public', 'profile'),
        filename: (req, file, cb) => {
          cb(null, `${v4()}.jpg`);
        },
      })
    })
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
