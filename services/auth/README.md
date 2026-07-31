# Auth Service

Serviço responsável pela identidade dos usuários do MiniFood: registro, login, perfil, reset de senha e autenticação de dois fatores por e-mail. Construído em NestJS (runtime Bun), seguindo Clean Architecture.

Não substitui o Keycloak — é uma fachada por cima dele. O Keycloak continua sendo o Identity Provider (guarda credenciais, emite e assina os JWTs); o auth-service é dono do perfil local do usuário (nome, e-mail, papel, preferência de 2FA) e implementa, com controle total de UX e conteúdo, fluxos que o Keycloak não expõe prontos para esse uso: reset de senha com token e e-mail próprios, e 2FA por código enviado por e-mail.

## Arquitetura

```
src/
├── domain/          # entidades, value objects, erros e eventos de domínio
├── application/      # casos de uso e portas (interfaces de repositório/provider)
├── infrastructure/   # Prisma, Keycloak, cifra, e-mail, autenticação JWT
└── presentation/      # controllers, DTOs e filtro HTTP
```

- **Domain**: `User`, `PasswordResetToken` e `TwoFactorChallenge` como entidades ricas, com `Email` como value object. Erros de domínio próprios por agregado (ex.: `UserNotFoundError`, `TwoFactorChallengeExpiredError`).
- **Application**: um caso de uso por operação (`register-user`, `login`, `verify-two-factor`, etc.), dependendo apenas de portas — nunca de Prisma ou do Keycloak diretamente:
  - `UserRepository` — persistência do perfil local (Prisma)
  - `IdentityProvider` — operações no Keycloak (registro, login, refresh, troca de senha)
  - `PasswordResetTokenRepository` / `TwoFactorChallengeRepository` — persistência dos desafios temporários
  - `EmailSender` — envio de e-mails (reset de senha, código de 2FA)
- **Infrastructure**: repositórios Prisma, mappers entidade↔persistência, `PrismaService`, o cliente do Keycloak (Admin API + token endpoint), `TokenCipher` (cifra o refresh token guardado durante o desafio de 2FA) e o guard JWT (`JwtAuthGuard`), que valida o token contra o Keycloak.
- **Presentation**: controller REST, DTOs de entrada/saída (validados com `class-validator`) e um filtro global que traduz exceções de domínio em respostas HTTP.

## Fluxos principais

### Registro

`POST /users/register` cria o usuário primeiro no Keycloak (via Admin API, com a senha) e, com o `sub` retornado, persiste o perfil local. O papel escolhido (`customer` / `establishment` / `courier`) é mapeado para a role de realm correspondente no Keycloak (`establishment` → `company`) e atribuída ao usuário automaticamente.

### Login e 2FA

Login é sempre validado contra o Keycloak (`grant_type=password`). O que acontece depois depende da flag `twoFactorEnabled` do usuário:

```
POST /users/login (senha correta)
  │
  ├─ twoFactorEnabled = false → retorna os tokens direto
  │
  └─ twoFactorEnabled = true
       → gera um código de 6 dígitos, envia por e-mail
       → cifra o refresh token do Keycloak e guarda junto do desafio
       → retorna { requiresTwoFactor: true, challengeId }

POST /users/2fa/verify { challengeId, code }
  → valida o código (expira em 5 min, máx. 5 tentativas)
  → decifra o refresh token e troca por tokens frescos no Keycloak
  → retorna os tokens de acesso
```

O access/refresh token do Keycloak só chega ao cliente depois da confirmação do código — nunca antes.

### Reset de senha

```
POST /users/reset-password/request { email }
  → sempre responde com sucesso (evita enumeração de usuários)
  → se o e-mail existir, gera um token próprio (hash, expira em 1h) e envia por e-mail

POST /users/reset-password/confirm { token, newPassword }
  → valida o token local
  → efetiva a nova senha no Keycloak (Admin API)
```

O envio em si (reset de senha e código de 2FA) é feito por `SmtpEmailSender` via SMTP (`nodemailer`), configurado pelas variáveis `SMTP_*`. É uma implementação da port `EmailSender` — trocar de provedor é só criar outra implementação e apontar o binding em `app.module.ts`.

## Endpoints

| Método | Rota | Autenticação | Descrição |
|---|---|---|---|
| GET | `/health` | — | Health check |
| POST | `/users/register` | — | Cria um usuário (cliente, estabelecimento ou entregador) |
| POST | `/users/login` | — | Autentica; pode exigir confirmação de 2FA |
| POST | `/users/2fa/verify` | — | Confirma o código de 2FA e libera os tokens |
| POST | `/users/refresh-token` | — | Renova os tokens de acesso |
| POST | `/users/reset-password/request` | — | Dispara o e-mail de reset de senha |
| POST | `/users/reset-password/confirm` | — | Efetiva a nova senha |
| GET | `/users/me` | Bearer | Retorna o perfil do usuário autenticado |
| PUT | `/users/me` | Bearer | Atualiza nome e/ou e-mail |
| PUT | `/users/me/two-factor` | Bearer | Ativa ou desativa 2FA por e-mail |

Via Kong (gateway), as rotas ficam sob o prefixo `/auth` (ex.: `http://localhost:8000/auth/users/login`).

## Documentação interativa (Swagger)

Com o serviço no ar:

```
http://localhost:4004/api/docs
```

## Variáveis de ambiente

Ver [`.env.example`](.env.example):

| Variável | Descrição |
|---|---|
| `PORT` | Porta HTTP do serviço (padrão `4004`) |
| `DATABASE_URL` | Connection string do Postgres (database `auth`) |
| `RABBITMQ_URL` | Connection string do RabbitMQ |
| `KEYCLOAK_ISSUER` | Issuer esperado no token (deve bater com o `iss` do JWT) |
| `KEYCLOAK_JWKS_URI` | URL das chaves públicas do Keycloak, para validar assinatura do token |
| `KEYCLOAK_CLIENT_ID` | Client público usado para login (`grant_type=password`) e refresh |
| `KEYCLOAK_INTERNAL_URL` | URL do realm que o processo do serviço alcança (token endpoint) |
| `KEYCLOAK_ADMIN_URL` | URL da Admin REST API do realm |
| `KEYCLOAK_ADMIN_CLIENT_ID` | Client confidencial com service account, usado para chamadas administrativas (criar usuário, atribuir role, trocar senha) |
| `KEYCLOAK_ADMIN_CLIENT_SECRET` | Secret do client acima |
| `TWO_FACTOR_TOKEN_SECRET` | Chave usada para cifrar o refresh token guardado durante o desafio de 2FA |
| `APP_URL` | Base URL usada para montar o link de reset de senha no e-mail |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_SECURE` | Configuração do servidor SMTP usado para enviar e-mails |
| `SMTP_USER` / `SMTP_PASS` | Credenciais SMTP (para Gmail, `SMTP_PASS` precisa ser uma senha de app, não a senha da conta) |
| `SMTP_FROM` | Remetente exibido nos e-mails (opcional; usa `SMTP_USER` se não definido) |

O client `KEYCLOAK_ADMIN_CLIENT_ID` precisa das roles `manage-users` e `view-realm` do client `realm-management`, atribuídas ao seu service account (Keycloak Admin Console → Clients → `auth-service-admin` → Service Account Roles).

## Como rodar

### Via Docker (recomendado)

A partir da raiz do monorepo:

```bash
bun run docker:up
```

O serviço sobe na porta `4004`, com Postgres, RabbitMQ e Keycloak já provisionados.

### Localmente

Suba a infra (Postgres, RabbitMQ, Keycloak, Kong):

```bash
bun run docker:dev:up
```

Instale dependências (raiz do monorepo) e rode o serviço:

```bash
bun install
bun run --cwd services/auth dev
```

## Banco de dados (Prisma)

Modelos: `User`, `PasswordResetToken`, `TwoFactorChallenge`, além das tabelas de suporte a mensageria confiável `OutboxEvent` e `InboxEvent`.

A partir da raiz do monorepo:

```bash
bun run prisma:generate:auth       # gera o client Prisma
bun run prisma:migrate:dev:auth    # cria/aplica migrations em dev
bun run prisma:studio:auth         # abre o Prisma Studio
```

## Testes

```bash
bun run --cwd services/auth test               # unitários
bun run --cwd services/auth test:integration    # integração (repositórios Prisma, banco real)
```

Ou, a partir da raiz:

```bash
bun run test:unit
```

Os testes de integração exigem o Postgres no ar (`bun run docker:dev:up`) e a migration aplicada (`bun run prisma:migrate:dev:auth`).

## Pendências conhecidas

- Eventos de domínio (`user.registered`, `user.profile-updated`) ainda não são publicados no RabbitMQ — falta o publisher do padrão outbox (a tabela `OutboxEvent` já existe no schema).
