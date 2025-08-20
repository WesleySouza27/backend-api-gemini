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
    try {
      return await this.messageService.sendUserAndBotMessage(createMessageDto);
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes('obrigatório')) {
        throw new BadRequestException(err.message);
      }
      if (err instanceof Error) {
        throw new NotFoundException(err.message);
      }
      throw err;
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getMessages(@Query('userId') userId: string) {
    try {
      return await this.messageService.getUserMessages(userId);
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes('obrigatório')) {
        throw new BadRequestException(err.message);
      }
      if (err instanceof Error) {
        throw new NotFoundException(err.message);
      }
      throw err;
    }
  }
}
