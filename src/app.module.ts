import { ClassSerializerInterceptor, MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { User } from './user/entities/user.entity';
import { PostModule } from './post/post.module';
import { Post } from './post/entities/post.entity';
import { AuthModule } from './auth/auth.module';
import { AuthMiddleware } from './auth/middleware/auth.middleware';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AuthGuard } from './auth/guard/auth.guard';
import { QueryFailedErrorFilter } from './common/filter/query-failed.filter';
import { Follow } from './user/entities/follow.entity';
import { PostUserLike } from './post/entities/postUserLike.entity';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        ENV: Joi.string().valid('dev', 'prod').required(),
        DB_TYPE: Joi.string().valid('postgres').required(),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_DATABASE: Joi.string().required(),
        ACCESS_TOKEN_SECRET: Joi.string().required(),
        REFRESH_TOKEN_SECRET: Joi.string().required(),
      }),
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: configService.get<string>('DB_TYPE') as 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [
          User,
          Post,
          Follow,
          PostUserLike,
        ],
        synchronize: configService.get<string>('ENV') === 'prod' ? false : true,
        ...(configService.get<string>('ENV') === 'prod' && {
          ssl: {
            rejectUnauthorized: false,
          }
        })
      }),
      inject: [ConfigService],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public'),
      serveRoot: '/public/'
    }),
    UserModule,
    PostModule,
    AuthModule
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: QueryFailedErrorFilter,
    }
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(
      AuthMiddleware
    )
    .exclude({
      path: 'auth/register',
      method: RequestMethod.POST,
    })
    .exclude({
      path: 'auth/login',
      method: RequestMethod.POST,
    })
    .exclude({
      path: 'public/*',
      method: RequestMethod.GET,
    })
    .forRoutes('*')
  }
}
