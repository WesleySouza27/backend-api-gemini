import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async sendMessage(@Body() createMessageDto: CreateMessageDto) {
    if (!createMessageDto.content || !createMessageDto.userId) {
      throw new BadRequestException('Conteúdo e userId são obrigatórios.');
    }

    const userExists = await this.messageService['prisma'].user.findUnique({
      where: { id: createMessageDto.userId },
    });
    if (!userExists) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    const userMessage = await this.messageService.create(
      createMessageDto.content,
      createMessageDto.userId,
      false,
    );
    const botReply = await this.messageService.askGemini(
      createMessageDto.content,
    );
    const botMessage = await this.messageService.create(
      botReply,
      createMessageDto.userId,
      true,
    );

    return { userMessage, botMessage };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getMessages(@Query('userId') userId: string) {
    if (!userId) {
      throw new BadRequestException('userId é obrigatório.');
    }

    const userExists = await this.messageService['prisma'].user.findUnique({
      where: { id: userId },
    });
    if (!userExists) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    const messages = await this.messageService.findByUser(userId);
    if (!messages || messages.length === 0) {
      throw new NotFoundException(
        'Nenhuma mensagem encontrada para este usuário.',
      );
    }
    return messages;
  }
}
