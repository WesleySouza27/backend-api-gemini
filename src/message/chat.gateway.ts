import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessageService } from './message.service';

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class ChatGateway {
  constructor(private readonly messageService: MessageService) {}

  @WebSocketServer()
  server: Server;

  // Recebe mensagem do cliente e responde só para ele
  @SubscribeMessage('send_message')
  async handleMessage(
    @MessageBody() data: { content: string; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    // Salva a mensagem do usuário
    await this.messageService.create({
      content: data.content,
      userId: data.userId,
      isBot: false,
    });

    // Gera resposta do bot
    const botReply = await this.messageService.askGemini(data.content);

    // Salva resposta do bot
    await this.messageService.create({
      content: botReply,
      userId: data.userId,
      isBot: true,
    });

    // Envia resposta só para o remetente
    client.emit('receive_message', {
      content: botReply,
      userId: data.userId,
      isBot: true,
    });
  }
}
