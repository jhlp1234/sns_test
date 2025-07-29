import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import * as bcrypt from 'bcryptjs';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { rejects } from 'assert';

const mockUserRepository = {
  findOne: jest.fn(),
}

const mockUserService = {
  create: jest.fn(),
}

const mockConfigService = {
  get: jest.fn(),
}

const mockJwtService = {
  signAsync: jest.fn(),
}

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: Repository<User>;
  let userService: UserService;
  let jwtService: JwtService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        }
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterAll(() => {
    jest.clearAllMocks();
  })

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should return registered user', async () => {
      const createUserDto = {name: 'test'};

      jest.spyOn(mockUserService, 'create').mockResolvedValue(createUserDto);

      const result = await service.register(createUserDto as CreateUserDto);

      expect(result).toEqual(createUserDto);
      expect(userService.create).toHaveBeenCalledWith(createUserDto);
    })
  })

  describe('login', () => {
    it('should login user', async () => {
      const user = {name: 'test', password: '1234'};
      const rawToken = 'Basic test';

      jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(service, 'parseBasicToken').mockReturnValue({username: 'test', password: '1234'});
      jest.spyOn(service, 'issueToken').mockResolvedValue('token');
      jest.spyOn(bcrypt, 'compare').mockImplementation((a, b) => true);

      const result = await service.login(rawToken);

      expect(bcrypt.compare).toHaveBeenCalledWith(user.password, '1234');
      expect(userRepository.findOne).toHaveBeenCalledWith({where: {name: user.name}});
      expect(service.issueToken).toHaveBeenCalledTimes(2);
      expect(result).toEqual({refreshToken: 'token', accessToken: 'token'});
    })

    it('should throw error because ', async () => {
      const rawToken = 'Basic test';

      jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue(null);

      expect(service.login(rawToken)).rejects.toThrow(NotFoundException);
    })

    it('should throw error because incorrect password', async () => {
      const rawToken = 'Basic test';
      const user = {name: 'test', password: '123'};

      jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockImplementation((a, b) => false);

      expect(service.login(rawToken)).rejects.toThrow(BadRequestException);
    })
  })

  describe('issueToken', () => {
    it('should generate refresh token', async () => {
      const secret = 'refresh_token_secret';
      const user = {id: 1, name: 'test'};

      jest.spyOn(mockConfigService, 'get').mockReturnValue(secret);
      jest.spyOn(mockJwtService, 'signAsync').mockResolvedValue({sub: 1});

      const result = await service.issueToken(user, true);

      expect(jwtService.signAsync).toHaveBeenCalledWith({
            sub: user.id,
            name: user.name,
            type: 'refresh',
        },
        {
            secret,
            expiresIn: '24h',
        })
      expect(result).toEqual({sub: 1});
    })

    it('should generate access token', async () => {
      const secret = 'access_token_secret';
      const user = {id: 1, name: 'test'};

      jest.spyOn(mockConfigService, 'get').mockReturnValue(secret);
      jest.spyOn(mockJwtService, 'signAsync').mockResolvedValue({sub: 1});

      const result = await service.issueToken(user, false);

      expect(jwtService.signAsync).toHaveBeenCalledWith({
            sub: user.id,
            name: user.name,
            type: 'access',
        },
        {
            secret,
            expiresIn: '24h',
        });
      expect(result).toEqual({sub: 1});
    })
  })

  describe('parseBasicToken', () => {
    it('should parse basic token', async () => {
      const user = {username: 'test', password: '1234'};
      const token = 'Basic dGVzdDoxMjM0';

      const result = service.parseBasicToken(token);

      expect(result).toEqual(user);
    })

    it('should throw error because of no token', async () => {
      expect(() => service.parseBasicToken('')).toThrow(BadRequestException);
    })

    it('should throw error because token is not basic token', async () => {
      expect(() => service.parseBasicToken('bearer test')).toThrow(BadRequestException);
    })
  })
});
