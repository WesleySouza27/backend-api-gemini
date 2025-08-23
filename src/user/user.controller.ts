import { Controller, Post, Body, Param, Get } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiProperty } from '@nestjs/swagger';
import { AuthService } from '../auth/auth.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @ApiProperty({ type: [CreateUserDto] })
  @Get()
  async getUsers() {
    return this.userService.findAll();
  }

  @ApiProperty({ example: 'username', description: 'Nome de usuário' })
  @Get(':username')
  async getUser(@Param('username') username: string) {
    return this.userService.findByUsername(username);
  }

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Post('login')
  async login(@Body() createUserDto: CreateUserDto) {
    return this.userService.validateUser(createUserDto);
  }
}
