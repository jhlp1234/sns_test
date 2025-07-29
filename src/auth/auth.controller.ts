import { BadRequestException, Body, Controller, Headers, Post, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { Public } from './decorator/public.decorator';
import { ApiBasicAuth } from '@nestjs/swagger';
import { Authorization } from './decorator/authorization.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Public()
  async register(@Body() createUserDto: CreateUserDto){
    return this.authService.register(createUserDto);
  }

  @Post('login')
  @Public()
  @ApiBasicAuth()
  async login(@Authorization() token: string){
    return this.authService.login(token);
  }

  @Post('token/access')
  @Public()
  async issueAccess(@Request() req){
    const payload = req.user;
    console.log(payload)
    
    if(!payload || payload.type !== 'refresh') throw new BadRequestException('잘못된 토큰');

    return {
      accessToken: await this.authService.issueToken({id: payload.sub, name: payload.name}, false)
    }
  }

}
