import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { HttpModule } from '@nestjs/axios';
import { ChatGateway } from './chat.gateway';

@Module({
  imports: [HttpModule],
  providers: [MessageService, ChatGateway],
  controllers: [MessageController],
})
export class MessageModule {}
