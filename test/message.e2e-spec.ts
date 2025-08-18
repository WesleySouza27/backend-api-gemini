import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { Server } from 'http';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

// Tipos e asserts para evitar "any"
type RegisterResponse = { userId: string };
type LoginResponse = {
  access_token?: string;
  token?: string;
  jwt?: string;
  userId?: string;
};
type MessageModel = {
  id: string;
  content: string;
  userId: string;
  isBot: boolean;
  createdAt: string | Date;
};
type SendMessageResponse = {
  userMessage: MessageModel;
  botMessage: MessageModel;
};

function isObject(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === 'object';
}

function assertRegisterResponse(
  body: unknown,
): asserts body is RegisterResponse {
  if (!isObject(body) || typeof body.userId !== 'string') {
    throw new Error('Resposta inválida de /user/register');
  }
}

function assertLoginResponse(body: unknown): asserts body is LoginResponse {
  if (!isObject(body)) throw new Error('Resposta inválida de /user/login');
}

function assertSendMessageResponse(
  body: unknown,
): asserts body is SendMessageResponse {
  if (!isObject(body)) throw new Error('Resposta inválida de POST /message');
  const um = body.userMessage;
  const bm = body.botMessage;
  if (!isObject(um) || !isObject(bm))
    throw new Error('Corpo sem userMessage/botMessage');
}

function assertMessagesArray(body: unknown): asserts body is MessageModel[] {
  if (!Array.isArray(body))
    throw new Error('Resposta de GET /message não é array');
}

describe('Message e2e', () => {
  let app: INestApplication;
  let server: Server;

  let userId: string;
  let token: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<INestApplication>();
    await app.init();
    server = app.getHttpServer() as unknown as Server;

    const username = `e2e_msg_${Date.now()}`;

    const registerRes = await request(server)
      .post('/user/register')
      .send({ username, password: '123456' });
    expect([200, 201]).toContain(registerRes.status);

    const registerBody = registerRes.body as unknown;
    assertRegisterResponse(registerBody);
    userId = registerBody.userId;

    const loginRes = await request(server)
      .post('/user/login')
      .send({ username, password: '123456' });
    expect([200, 201]).toContain(loginRes.status);

    const loginBody = loginRes.body as unknown;
    assertLoginResponse(loginBody);
    token = loginBody.access_token || loginBody.token || loginBody.jwt || '';
  });

  it('POST /message deve criar mensagem do usuário e resposta do bot', async () => {
    if (!token) {
      throw new Error(
        'Login não retornou token JWT (access_token). Ajuste o /user/login.',
      );
    }

    const res = await request(server)
      .post('/message')
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'Olá', userId });

    expect([200, 201]).toContain(res.status);

    const body = res.body as unknown;
    assertSendMessageResponse(body);

    const { userMessage, botMessage } = body;

    expect(userMessage).toMatchObject({
      content: 'Olá',
      userId,
      isBot: false,
    });
    expect(botMessage).toMatchObject({
      userId,
      isBot: true,
    });
  });

  it('GET /message deve listar mensagens do usuário', async () => {
    if (!token) {
      throw new Error(
        'Login não retornou token JWT (access_token). Ajuste o /user/login.',
      );
    }

    const res = await request(server)
      .get('/message')
      .set('Authorization', `Bearer ${token}`)
      .query({ userId });

    expect(res.status).toBe(200);

    const body = res.body as unknown;
    assertMessagesArray(body);

    expect(body.length).toBeGreaterThanOrEqual(1);
  });

  afterAll(async () => {
    await app.close();
  });
});
