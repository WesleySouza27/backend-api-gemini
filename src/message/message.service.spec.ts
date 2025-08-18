import { Test, TestingModule } from '@nestjs/testing';
import { MessageService } from './message.service';
import { PrismaService } from '../database/prisma.service';
import { prismaMock } from '../database/mocks/prisma.service';
import { HttpService } from '@nestjs/axios';

describe('MessageService', () => {
  let service: MessageService;
  const USER_ID = '11111111-1111-1111-1111-111111111111';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageService,
        { provide: PrismaService, useValue: prismaMock },
        // Se o askGemini usar HttpService, mantemos o mock simples aqui
        { provide: HttpService, useValue: { post: jest.fn() } },
      ],
    }).compile();

    service = module.get<MessageService>(MessageService);
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  it('deve criar uma mensagem do usuário', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: USER_ID });
    const created = {
      id: 'msg-1',
      content: 'Olá',
      userId: USER_ID,
      isBot: false,
      createdAt: new Date(),
    };
    prismaMock.message.create.mockResolvedValue(created);

    const result = await service.create('Olá', USER_ID, false);

    expect(result).toEqual(created);
    expect(prismaMock.message.create).toHaveBeenCalledWith({
      data: { content: 'Olá', userId: USER_ID, isBot: false },
    });
    expect(prismaMock.message.create).toHaveBeenCalledWith({
      data: { content: 'Olá', userId: USER_ID, isBot: false },
    });
  });

  it('deve buscar mensagens por usuário', async () => {
    const messages = [
      {
        id: 'm1',
        content: 'Oi',
        userId: USER_ID,
        isBot: false,
        createdAt: new Date(),
      },
      {
        id: 'm2',
        content: 'Olá!',
        userId: USER_ID,
        isBot: true,
        createdAt: new Date(),
      },
    ];
    prismaMock.message.findMany.mockResolvedValue(messages);

    const result = await service.findByUser(USER_ID);

    expect(result).toEqual(messages);
    // Caso seu service use orderBy, ajuste este expect conforme sua implementação:
    expect(prismaMock.message.findMany).toHaveBeenCalledWith({
      where: { userId: USER_ID },
      orderBy: { createdAt: 'asc' },
    });
  });

  it('deve propagar erro do Prisma ao criar mensagem', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: USER_ID });
    prismaMock.message.create.mockRejectedValue(new Error('DB error'));

    await expect(service.create('Falha', USER_ID, false)).rejects.toThrow(
      'DB error',
    );
  });
});
