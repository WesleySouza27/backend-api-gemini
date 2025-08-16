import { Controller, Post, Body, Param, Get } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiBody, ApiProperty } from '@nestjs/swagger';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiProperty({ type: [CreateUserDto] })
  @Get()
  async getUsers() {
    return this.userService.findAll();
  }

  @ApiProperty({ example: 'user-id-123', description: 'ID do usuário' })
  @Get(':userId')
  async getUser(@Param('userId') userId: string) {
    return this.userService.findById(userId);
  }

  @ApiBody({ type: CreateUserDto })
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(
      createUserDto.username,
      createUserDto.password,
    );
  }

  @Post('login')
  async login(@Body() createUserDto: CreateUserDto) {
    const user = await this.userService.validateUser(
      createUserDto.username,
      createUserDto.password,
    );
    if (!user) {
      return { message: 'Usuário ou senha inválidos' };
    }
    return { message: 'Login realizado com sucesso', userId: user.id };
  }
}
