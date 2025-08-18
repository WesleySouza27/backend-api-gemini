import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../database/prisma.service';
import { prismaMock } from '../database/mocks/prisma.service';

describe('UserService', () => {
  let service: UserService;
  const USER_ID = '11111111-1111-1111-1111-111111111111';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  it('deve criar um usuário', async () => {
    const user = { id: USER_ID, username: 'teste', password: 'senha' };
    prismaMock.user.create.mockResolvedValue(user);
    const result = await service.create('teste', 'senha');
    expect(result).toEqual(user);
    expect(prismaMock.user.create).toHaveBeenCalled();
  });

  it('deve buscar usuário por id', async () => {
    const user = { id: USER_ID, username: 'teste', password: 'senha' };
    prismaMock.user.findUnique.mockResolvedValue(user);
    const result = await service.findById(USER_ID);
    expect(result).toEqual(user);
  });

  it('deve retornar null se usuário não encontrado', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    const result = await service.findByUsername('naoexiste');
    expect(result).toBeNull();
  });

  it('deve retornar todos os usuários', async () => {
    const users = [{ id: USER_ID, username: 'teste', password: 'senha' }];
    prismaMock.user.findMany.mockResolvedValue(users);
    const result = await service.findAll();
    expect(result).toEqual(users);
  });
});
