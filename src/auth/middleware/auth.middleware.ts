import { BadRequestException, Injectable, NestMiddleware } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { NextFunction, Request, Response } from "express";

@Injectable()
export class AuthMiddleware implements NestMiddleware {
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ){}

    async use(req: Request & {user: unknown}, res: Response, next: NextFunction) {
        const rawToken = req.headers['authorization'] as string;
        if(!rawToken) throw new BadRequestException('토큰 없음');

        const [bearer, token] = rawToken.split(' ');
        if(bearer.toLowerCase() !== 'bearer') throw new BadRequestException('Bearer 토큰 아님');

        const decoded = await this.jwtService.decode(token);

        try {
            const secretKey = decoded.type === 'refresh' ? 'REFRESH_TOKEN_SECRET' : 'ACCESS_TOKEN_SECRET';

            const payload = await this.jwtService.verifyAsync(token, {secret: this.configService.get<string>(secretKey)});
           
            req.user = payload;
            
            next();
        } catch (error) {
            //console.log(error);

            next();
        }
    }
}