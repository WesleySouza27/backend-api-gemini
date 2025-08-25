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
    const user = await this.userService.create(createUserDto);
    return { userId: user.id, username: user.username };
  }

  @Post('login')
  async login(@Body() body: { username: string; password: string }) {
    const { userId, username } = await this.userService.validateUser(body);
    return this.authService.login({ id: userId, username });
  }
}
