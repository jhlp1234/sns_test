import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseInterceptors, ClassSerializerInterceptor, Query, UploadedFile } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Public } from 'src/auth/decorator/public.decorator';
import { UserId } from 'src/auth/decorator/user-id.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('user')
@ApiBearerAuth()
//@UseInterceptors(ClassSerializerInterceptor)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({
    description: 'create user'
  })
  @ApiResponse({
    status: 201,
    description: '잘 생성됨'
  })
  @ApiResponse({
    status: 400,
    description: '이미 사용자가 있을 때'
  })
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  //@Public()
  @ApiOperation({
    description: 'get all user'
  })
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.remove(id);
  }

  @Patch('profile/set')
  @UseInterceptors(FileInterceptor('profile'))
  setProfilePic(@UserId() userId: number, @UploadedFile() profile: Express.Multer.File){
    return this.userService.setProfilePic(userId, profile);
  }

  @Get('follow/follower')
  getFollower(@UserId() userId: number){
    return this.userService.getFollower(userId);
  }

  @Get('follow/following')
  getFollowing(@UserId() userId: number, @Query('cursor') cursor?: string){
    return this.userService.getFollowing(userId, cursor);
  }

  @Post('follow/:id')
  doFollow(@UserId() followerId: number, @Param('id', ParseIntPipe) followId: number){
    return this.userService.doFollow(followerId, followId);
  }

  @Delete('unfollow/:id')
  unFollow(@UserId() followerId: number, @Param('id', ParseIntPipe) followingId: number){
    return this.userService.unFollow(followerId, followingId);
  }

  @Get('like/post')
  getLikedPosts(@UserId() userId: number){
    return this.userService.getLikedPosts(userId);
  }
}
