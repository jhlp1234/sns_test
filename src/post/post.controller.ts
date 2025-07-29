import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseInterceptors, UploadedFile } from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { UserId } from 'src/auth/decorator/user-id.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('post')
@ApiBearerAuth()
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  @UseInterceptors(FileInterceptor('post'))
  create(@Body() createPostDto: CreatePostDto, @UserId() userId: number, @UploadedFile() file: Express.Multer.File) {
    
    return this.postService.create(createPostDto, userId, file?.filename);
  }

  @Get()
  findAll() {
    return this.postService.findAll();
  }

  @Get('like/:id')
  getLikedUsers(@Param('id', ParseIntPipe) postId: number){
    return this.postService.getLikedUsers(postId);
  }

  @Post('like/:id')
  doLike(@UserId() userId: number, @Param('id', ParseIntPipe) postId: number){
    return this.postService.doLike(userId, postId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.postService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updatePostDto: UpdatePostDto) {
    return this.postService.update(id, updatePostDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.postService.remove(id);
  }

  @Delete('like/:id')
  disLike(@UserId() userId: number, @Param('id', ParseIntPipe) postId: number){
    return this.postService.disLike(userId, postId);
  }
}
