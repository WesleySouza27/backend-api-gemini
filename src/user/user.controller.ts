import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiProperty } from '@nestjs/swagger';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiProperty({ type: [CreateUserDto] })
  @Get()
  async getUsers() {
    const users = await this.userService.findAll();
    if (!users || users.length === 0) {
      throw new NotFoundException('Nenhum usuário encontrado.');
    }
    return users;
  }

  @ApiProperty({ example: 'user-id-123', description: 'ID do usuário' })
  @Get(':userId')
  async getUser(@Param('userId') userId: string) {
    if (!userId) {
      throw new BadRequestException('ID do usuário é obrigatório.');
    }
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }
    return user;
  }

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    if (!createUserDto.username || !createUserDto.password) {
      throw new BadRequestException('Usuário e senha são obrigatórios.');
    }
    const existingUser = await this.userService.findByUsername(
      createUserDto.username,
    );
    if (existingUser) {
      throw new BadRequestException('Nome de usuário já está em uso.');
    }
    const user = await this.userService.create(
      createUserDto.username,
      createUserDto.password,
    );
    return { message: 'Usuário cadastrado com sucesso', userId: user.id };
  }

  @Post('login')
  async login(@Body() createUserDto: CreateUserDto) {
    if (!createUserDto.username || !createUserDto.password) {
      throw new BadRequestException('Usuário e senha são obrigatórios.');
    }
    const user = await this.userService.validateUser(
      createUserDto.username,
      createUserDto.password,
    );
    if (!user) {
      throw new UnauthorizedException('Usuário ou senha inválidos.');
    }
    return {
      message: 'Login realizado com sucesso',
      userId: user.id,
      username: user.username,
    };
  }
}
