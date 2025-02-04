/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcryptjs from 'bcryptjs';

import { CreateUserDto, LoginDto, SignupDto, UpdateAuthDto } from './dto';
import { User } from './entities';
import { JwtPayload, LoginResponse } from './interfaces';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    private readonly jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const { password, ...userData } = createUserDto;

      const newUser = new this.userModel({
        password: bcryptjs.hashSync(password, 10),
        ...userData,
      });

      await newUser.save();

      const { password: _, ...user } = newUser.toJSON();

      return user;
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && error.code === 11000) {
        throw new BadRequestException('User already exists');
      }
      throw new InternalServerErrorException('Something went wrong.', {
        cause: error,
      });
    }
  }

  async signup(signupDto: SignupDto): Promise<LoginResponse> {
    const user = await this.create(signupDto);

    return { user, token: await this.getJwtToken({ id: user._id }) };
  }

  async signin(loginDto: LoginDto): Promise<LoginResponse> {
    const { email, password } = loginDto;

    const userFound = await this.userModel.findOne({ email });

    if (!userFound) throw new UnauthorizedException('Invalid credentials');

    if (!userFound.isActive)
      throw new UnauthorizedException('Invalid credentials');

    if (!bcryptjs.compareSync(password, userFound.password)) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { password: _, ...user } = userFound.toJSON();
    const token = await this.getJwtToken({ id: userFound.id });

    return {
      user,
      token,
    };
  }

  async findAll(): Promise<User[]> {
    return await this.userModel.find();
  }

  findById(id: string) {
    return this.userModel.findById(id);
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    console.log(updateAuthDto);
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }

  async getJwtToken(payload: JwtPayload) {
    const token = await this.jwtService.signAsync(payload);

    console.log(token);

    return token;
  }
}
