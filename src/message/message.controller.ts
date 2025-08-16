import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  async sendMessage(@Body() createMessageDto: CreateMessageDto) {
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

  @Get()
  async getMessages(@Query('userId') userId: string) {
    return this.messageService.findByUser(String(userId));
  }
}
