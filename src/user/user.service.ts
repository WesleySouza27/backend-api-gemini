import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const users = await this.prisma.user.findMany();
    if (!users || users.length === 0) {
      throw new NotFoundException('Nenhum usuário encontrado.');
    }
    return users;
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async create(createUserDto: CreateUserDto) {
    if (!createUserDto.username || !createUserDto.password) {
      throw new BadRequestException('Usuário e senha são obrigatórios.');
    }
    const existingUser = await this.findByUsername(createUserDto.username);
    if (existingUser) {
      throw new BadRequestException('Nome de usuário já está em uso.');
    }
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    return this.prisma.user.create({
      data: {
        username: createUserDto.username,
        password: hashedPassword,
      },
    });
  }

  async validateUser({
    username,
    password,
  }: {
    username: string;
    password: string;
  }) {
    if (!username || !password) {
      throw new BadRequestException('Usuário e senha são obrigatórios.');
    }
    const user = await this.findByUsername(username);
    if (!user) {
      throw new UnauthorizedException('Usuário ou senha inválidos.');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Usuário ou senha inválidos.');
    }
    return { userId: user.id, username: user.username };
  }

  async findByUsername(username: string) {
    if (!username) {
      throw new BadRequestException('Nome de usuário é obrigatório.');
    }
    const user = await this.prisma.user.findUnique({ where: { username } });
    return user ?? null;
  }
}
