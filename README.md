# MiniFood

Plataforma de delivery construída como um monorepo de microsserviços, no estilo iFood. Cada domínio de negócio (catálogo, pedidos, entrega) roda como um serviço independente, integrado via API Gateway e mensageria assíncrona.

## Arquitetura

```
Frontend → Kong (API Gateway) → auth / catalog / order / delivery
                                       ↓
                                  PostgreSQL (1 database por serviço)
                                       ↓
                                   RabbitMQ (eventos entre serviços)

Keycloak é o Identity Provider: emite os tokens JWT usados por todos os
serviços. O auth-service não o substitui — ele é uma fachada por cima do
Keycloak (Admin API + token endpoint), dona do perfil local do usuário
(nome, e-mail, papel, preferência de 2FA) e dos fluxos de reset de senha
e 2FA por e-mail que o Keycloak não expõe prontos.
```

- **Kong**: gateway único de entrada (porta `8000`). Roteia `/auth`, `/catalog`, `/orders` e `/delivery` para os serviços correspondentes, removendo o prefixo (`strip_path`).
- **Keycloak**: Identity Provider. Realm `mini-food` importado automaticamente a partir de `docker/keycloak`. Guarda credenciais e emite os JWTs; cada serviço valida a assinatura sozinho via JWKS.
- **PostgreSQL**: uma instância compartilhada, com um database por serviço (`auth`, `catalog`, `order`, `delivery`), criados via `docker/postgres/init-databases.sh`.
- **RabbitMQ**: barramento de eventos entre os serviços (padrão outbox/inbox nos serviços que já implementam persistência).

## Serviços

| Serviço | Status | Porta | Descrição |
|---|---|---|---|
| [auth](services/auth) | Implementado | 4004 | Registro, login, perfil, reset de senha e 2FA por e-mail |
| [catalog](services/catalog) | Implementado | 4001 | Estabelecimentos, categorias e produtos |
| order | Esqueleto | 4002 | Pedidos (ainda não implementado) |
| delivery | Esqueleto | 4003 | Entregas (ainda não implementado) |

Cada serviço é um app NestJS independente, rodando em runtime Bun, seguindo Clean Architecture (domain / application / infrastructure / presentation).

## Estrutura do monorepo

```
services/        # microsserviços (workspaces)
packages/shared/  # código compartilhado: eventos, autenticação, DTOs comuns
docker/           # configs de Kong, Keycloak e Postgres
```

O pacote [`@miniFood/shared`](packages/shared) contém o envelope de eventos de domínio, o contrato do usuário autenticado (JWT) e DTOs comuns (paginação, filtros) usados por todos os serviços.

## Pré-requisitos

- [Bun](https://bun.sh) (workspaces do monorepo)
- Docker e Docker Compose

## Como rodar

Instale as dependências na raiz do monorepo:

```bash
bun install
```

Suba toda a infraestrutura e os serviços com Docker:

```bash
bun run docker:up
```

Isso builda e sobe Postgres, RabbitMQ, Keycloak, Kong e os serviços de aplicação. As imagens são construídas com contexto na raiz do repo (necessário para incluir `packages/shared` no build).

Outros comandos úteis:

```bash
bun run docker:down          # para os containers
bun run docker:prune         # para e remove volumes (reset completo)

bun run docker:dev:up        # sobe só a infra (postgres, rabbitmq, keycloak, kong)
                              # útil para rodar um serviço localmente fora do Docker
```

### URLs principais (com a infra no ar)

- Gateway (Kong): `http://localhost:8000`
- Keycloak: `http://localhost:8080` (admin/admin)
- RabbitMQ Management: `http://localhost:15672` (admin/admin)
- Auth (direto, sem gateway): `http://localhost:4004`
- Catalog (direto, sem gateway): `http://localhost:4001`

## Testes

```bash
bun run test                       # unitários do auth e do catalog (sem banco)
bun run test:unit                  # idem
bun run test:coverage              # com cobertura

# integração (banco real — rodar por serviço, cada um isolado num processo próprio)
bun run test:integration:catalog
bun run test:integration:auth
```

> Não use `bun test` direto na raiz: ele varre todo o monorepo no mesmo processo, incluindo os testes de integração de `catalog` e `auth`, que usam bancos diferentes — o primeiro `.env` carregado "gruda" e os testes do outro serviço conectam no banco errado.

## Prisma

```bash
bun run prisma:generate:catalog       # gera o client (catalog)
bun run prisma:migrate:dev:catalog    # roda migrations em dev (catalog)
bun run prisma:studio:catalog         # abre o Prisma Studio (catalog)

bun run prisma:generate:auth          # gera o client (auth)
bun run prisma:migrate:dev:auth       # roda migrations em dev (auth)
bun run prisma:studio:auth            # abre o Prisma Studio (auth)
```

## Formatação e lint

```bash
bun run format   # prettier em todo o repo
```

## CI

O workflow em [`.github/workflows/ci.yml`](.github/workflows/ci.yml) instala dependências, gera o client Prisma do catalog, roda type-check e os testes unitários a cada push/PR na `main`.
