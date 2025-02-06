import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginDto, SignupDto } from './dto';
import { AuthGuard } from './guards';
import { UserRequest } from './decorators';
import { User } from './entities';
import { LoginResponse } from './interfaces';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('signup')
  signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }

  @Post('signin')
  signin(@Body() loginDto: LoginDto) {
    return this.authService.signin(loginDto);
  }

  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.authService.findAll();
  }

  @UseGuards(AuthGuard)
  @Get('check-token')
  async checkToken(@UserRequest() user: User): Promise<LoginResponse> {
    return {
      user,
      token: await this.authService.getJwtToken({ id: user._id }),
    };
  }
}
