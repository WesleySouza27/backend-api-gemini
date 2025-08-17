import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';

export interface AuthUser {
  id: string;
  username: string;
}

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    username: string,
    password: string,
  ): Promise<AuthUser | null> {
    const user = await this.userService.validateUser(username, password);
    if (!user) throw new UnauthorizedException('Usuário ou senha inválidos.');
    return { id: user.id, username: user.username };
  }

  login(user: AuthUser) {
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      userId: user.id,
      username: user.username,
    };
  }
}
