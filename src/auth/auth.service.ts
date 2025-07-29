import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ){}

    async register(createUserDto: CreateUserDto){
        //const {username, password} = this.parseBasicToken(rawToken);
        
        return this.userService.create(createUserDto);
    }

    async login(rawToken: string){
        const {username, password} = this.parseBasicToken(rawToken);
        const user = await this.userRepository.findOne({where: {name: username}});
        if(!user) throw new NotFoundException('없는 사용자 이름');

        const compare = await bcrypt.compare(password, user.password);
        if(!compare) throw new BadRequestException('잘못된 비밀번호');

        return {
            refreshToken: await this.issueToken(user, true),
            accessToken: await this.issueToken(user, false),
        }
    }

    parseBasicToken(rawToken: string){
        if(!rawToken) throw new BadRequestException('토큰 없음');
        const [basic, token] = rawToken.split(' ');
        if(basic.toLowerCase() !== 'basic') throw new BadRequestException('basic 토큰이 아님');

        const decoded = Buffer.from(token, 'base64').toString('utf-8');
        const [username, password] = decoded.split(':');
        
        return {username, password};
    }

    issueToken(user: {id: number, name: string}, isRefreshToken: boolean){
        const accessTokenSecret = this.configService.get<string>('ACCESS_TOKEN_SECRET');
        const refreshTokenSecret = this.configService.get<string>('REFRESH_TOKEN_SECRET');

        return this.jwtService.signAsync({
            sub: user.id,
            name: user.name,
            type: isRefreshToken ? 'refresh' : 'access',
        },
        {
            secret: isRefreshToken ? refreshTokenSecret : accessTokenSecret,
            expiresIn: '24h',
        });
    }


}
