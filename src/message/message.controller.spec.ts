import { Test, TestingModule } from '@nestjs/testing';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';

type Message = {
  id: string;
  content: string;
  userId: string;
  isBot: boolean;
  createdAt: Date;
};

type CreateFn = jest.Mock<Promise<Message>, [string, string, boolean]>;
type FindByUserFn = jest.Mock<Promise<Message[]>, [string]>;
type AskGeminiFn = jest.Mock<Promise<string>, [string]>;
type FindUniqueFn = jest.Mock<
  Promise<{ id: string } | null>,
  [{ where: { id: string } }]
>;

type PrismaUserStub = {
  user: {
    findUnique: FindUniqueFn;
  };
};

type MessageServiceMock = {
  create: CreateFn;
  findByUser: FindByUserFn;
  askGemini: AskGeminiFn;
  prisma: PrismaUserStub;
};

describe('MessageController', () => {
  let controller: MessageController;
  const USER_ID = '11111111-1111-1111-1111-111111111111';

  const messageServiceMock: MessageServiceMock = {
    create: jest.fn<ReturnType<CreateFn>, Parameters<CreateFn>>(),
    findByUser: jest.fn<ReturnType<FindByUserFn>, Parameters<FindByUserFn>>(),
    askGemini: jest.fn<ReturnType<AskGeminiFn>, Parameters<AskGeminiFn>>(),
    prisma: {
      user: {
        findUnique: jest.fn<
          ReturnType<FindUniqueFn>,
          Parameters<FindUniqueFn>
        >(),
      },
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessageController],
      providers: [{ provide: MessageService, useValue: messageServiceMock }],
    }).compile();

    controller = module.get<MessageController>(MessageController);

    // padrão: usuário existe (configure após clearAllMocks)
    messageServiceMock.prisma.user.findUnique.mockResolvedValue({
      id: USER_ID,
    });
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('POST /message (sendMessage)', () => {
    it('deve enviar mensagem e retornar userMessage e botMessage', async () => {
      const dto: CreateMessageDto = { content: 'Olá', userId: USER_ID };

      const userMessage: Message = {
        id: 'm1',
        content: 'Olá',
        userId: USER_ID,
        isBot: false,
        createdAt: new Date(),
      };
      const botMessage: Message = {
        id: 'm2',
        content: 'Olá! Como posso ajudar?',
        userId: USER_ID,
        isBot: true,
        createdAt: new Date(),
      };

      messageServiceMock.create
        .mockResolvedValueOnce(userMessage)
        .mockResolvedValueOnce(botMessage);
      messageServiceMock.askGemini.mockResolvedValue(botMessage.content);

      const result = await controller.sendMessage(dto);

      expect(messageServiceMock.prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: USER_ID },
      });
      expect(messageServiceMock.askGemini).toHaveBeenCalledWith('Olá');
      expect(messageServiceMock.create).toHaveBeenCalledTimes(2);
      expect(result).toEqual({ userMessage, botMessage });
    });

    it('deve lançar BadRequest se faltar content ou userId', async () => {
      await expect(
        controller.sendMessage({ content: '', userId: USER_ID }),
      ).rejects.toBeInstanceOf(BadRequestException);

      await expect(
        controller.sendMessage({
          content: 'Oi',
          userId: '',
        } as CreateMessageDto),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('GET /message (getMessages)', () => {
    it('deve retornar mensagens por userId', async () => {
      const messages: Message[] = [
        {
          id: 'm1',
          content: 'Oi',
          userId: USER_ID,
          isBot: false,
          createdAt: new Date(),
        },
      ];
      messageServiceMock.findByUser.mockResolvedValue(messages);

      const result = await controller.getMessages(USER_ID);

      expect(messageServiceMock.prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: USER_ID },
      });
      expect(messageServiceMock.findByUser).toHaveBeenCalledWith(USER_ID);
      expect(result).toEqual(messages);
    });

    it('deve lançar NotFound se não houver mensagens', async () => {
      messageServiceMock.prisma.user.findUnique.mockResolvedValue({
        id: USER_ID,
      });
      messageServiceMock.findByUser.mockResolvedValue([]);

      await expect(controller.getMessages(USER_ID)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });
});
