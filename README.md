<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

# backend-api-gemini

API NestJS para o desafio — backend que usa Prisma/Postgres, JWT e WebSocket (Socket.IO).

## Como rodar localmente (detalhado)

Pré-requisitos

- Node.js >= 18, npm
- PostgreSQL (ou outro DB suportado pelo Prisma) — exemplo: 127.0.0.1:5432
- Windows PowerShell (instruções abaixo em PowerShell)

1. Clonar e instalar dependências

```powershell
git clone https://github.com/usuario/exemplo-backend.git
cd exemplo-backend
npm install
```

2. Preparar variáveis de ambiente
   Crie um arquivo `.env` na raiz com pelo menos estas variáveis (exemplos genéricos — troque pelos seus valores):

```
DATABASE_URL="postgresql://dbuser:dbpass@127.0.0.1:5432/dbname?schema=public"
JWT_SECRET="uma_chave_secreta_aqui"
PORT=3000
```

Exemplos de URLs que você pode usar:

- Local: http://localhost:3000
- API pública de exemplo: https://api.example.com
- Staging: https://staging.example.com

3. Gerar Prisma Client e aplicar migrations

```powershell
npx prisma generate
# para desenvolvimento (vai criar/migrar e abrir prompt):
npx prisma migrate dev --name init
# ou aplicar migrations existentes (produção):
npx prisma migrate deploy
```

4. Rodar em modo desenvolvimento (hot reload)

```powershell
npm run start:dev
# A API estará em: http://localhost:3000 (ou PORT definido no .env)
```

5. Build e rodar em produção

```powershell
npm run build
npm run start:prod
```

6. Limpar dados do banco (truncar tabelas) — PowerShell

- truncar dados e reiniciar sequences (Postgres):

```powershell
echo TRUNCATE TABLE "Message", "User" RESTART IDENTITY CASCADE; | npx prisma db execute --url "%DATABASE_URL%" --stdin
```

- ou via Prisma Client no código/testes:

```ts
await prisma.message.deleteMany();
await prisma.user.deleteMany();
```

## Testes

- Testes unitários

```powershell
npm run test
```

- Testes e2e

```powershell
npm run test:e2e
```

Dicas:

- Use usernames únicos nos testes e2e (ex.: `e2euser_${Date.now()}`) para evitar 400 por duplicidade.
- Para e2e é recomendado usar um DATABASE_URL dedicado (banco de teste) e limpar dados antes.

## Exemplos de requests (curl)

- Registrar usuário

```bash
curl -X POST http://localhost:3000/user/register \
  -H "Content-Type: application/json" \
  -d '{"username":"novo_usuario","password":"senha123"}'
```

- Login (recebe token JWT)

```bash
curl -X POST http://localhost:3000/user/login \
  -H "Content-Type: application/json" \
  -d '{"username":"novo_usuario","password":"senha123"}'
# Resposta esperada: { "access_token": "..." } ou { "userId": "..." }
```

- Enviar mensagem (rota protegida com JWT)

```bash
curl -X POST http://localhost:3000/message \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <SEU_JWT_AQUI>" \
  -d '{"content":"Olá","userId":"<USER_ID>"}'
```

- Listar mensagens por usuário

```bash
curl "http://localhost:3000/message?userId=<USER_ID>" \
  -H "Authorization: Bearer <SEU_JWT_AQUI>"
```

Substitua `<SEU_JWT_AQUI>` e `<USER_ID>` pelos valores retornados pelas rotas de registro/login.

## Tecnologias utilizadas

- NestJS (TypeScript)
- Prisma (ORM)
- PostgreSQL
- Jest + Supertest (testes)
- Passport + JWT (autenticação)
- Socket.IO (WebSocket)
- class-validator / class-transformer
- Swagger (documentação)

- Author - [Wesley Souza](https://www.linkedin.com/in/wesley-souza-/)

- deploy - [api](https://backend-api-gemini.onrender.com/api)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
