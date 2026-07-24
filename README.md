# MiniFood

Plataforma de delivery construída como um monorepo de microsserviços, no estilo iFood. Cada domínio de negócio (catálogo, pedidos, entrega) roda como um serviço independente, integrado via API Gateway e mensageria assíncrona.

## Arquitetura

```
Frontend → Kong (API Gateway) → catalog / order / delivery
                                       ↓
                                  PostgreSQL (1 database por serviço)
                                       ↓
                                   RabbitMQ (eventos entre serviços)

Keycloak emite os tokens JWT usados por todos os serviços.
```

- **Kong**: gateway único de entrada (porta `8000`). Roteia `/catalog`, `/orders` e `/delivery` para os serviços correspondentes, removendo o prefixo (`strip_path`).
- **Keycloak**: Identity Provider. Realm `mini-food` importado automaticamente a partir de `docker/keycloak`.
- **PostgreSQL**: uma instância compartilhada, com um database por serviço (`catalog`, `order`, `delivery`), criados via `docker/postgres/init-databases.sh`.
- **RabbitMQ**: barramento de eventos entre os serviços (padrão outbox/inbox nos serviços que já implementam persistência).

## Serviços

| Serviço | Status | Porta | Descrição |
|---|---|---|---|
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
- Catalog (direto, sem gateway): `http://localhost:4001`

## Testes

```bash
bun test               # todos os testes
bun run test:unit      # unitários do catalog
bun run test:coverage  # com cobertura
```

## Prisma (catalog)

```bash
bun run prisma:generate:catalog       # gera o client
bun run prisma:migrate:dev:catalog    # roda migrations em dev
bun run prisma:studio:catalog         # abre o Prisma Studio
```

## Formatação e lint

```bash
bun run format   # prettier em todo o repo
```

## CI

O workflow em [`.github/workflows/ci.yml`](.github/workflows/ci.yml) instala dependências, gera o client Prisma do catalog, roda type-check e os testes unitários a cada push/PR na `main`.
