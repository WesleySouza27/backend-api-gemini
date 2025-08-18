import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { Server } from 'http';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('User e2e', () => {
  let app: INestApplication;
  let server: Server;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<INestApplication>();
    await app.init();
    server = app.getHttpServer() as unknown as Server;
  });

  it('/user/register (POST) - deve cadastrar usuário', async () => {
    const res = await request(server)
      .post('/user/register')
      .send({ username: 'e2euser', password: '123456' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('userId');
  });

  it('/user/login (POST) - deve logar usuário', async () => {
    await request(server)
      .post('/user/register')
      .send({ username: 'e2elogin', password: '123456' });

    const res = await request(server)
      .post('/user/login')
      .send({ username: 'e2elogin', password: '123456' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('userId');
  });

  afterAll(async () => {
    await app.close();
  });
});
