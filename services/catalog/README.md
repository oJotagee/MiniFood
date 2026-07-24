# Catalog Service

Serviço responsável pelo catálogo do MiniFood: estabelecimentos, categorias de produtos e produtos. Construído em NestJS (runtime Bun), seguindo Clean Architecture.

## Arquitetura

```
src/
├── domain/          # entidades, value objects, erros e eventos de domínio
├── application/      # casos de uso e portas (interfaces de repositório)
├── infrastructure/   # Prisma, repositórios, autenticação JWT
└── presentation/      # controllers, DTOs e filtros HTTP
```

- **Domain**: `Establishment`, `Product` e `ProductCategory` como entidades ricas, com `Money` e `Address` como value objects. Erros e eventos de domínio próprios (ex.: `ProductCreatedEvent`, `EstablishmentUpdatedEvent`).
- **Application**: um caso de uso por operação (`create-product`, `find-all-establishments`, etc.), dependendo apenas de portas (`*RepositoryPort`), nunca de implementações concretas.
- **Infrastructure**: repositórios Prisma, mappers entidade↔persistência, `PrismaService` e o guard de autenticação JWT (`JwtAuthGuard`), que valida o token contra o Keycloak.
- **Presentation**: controllers REST, DTOs de entrada/saída (validados com `class-validator`) e um filtro global que traduz exceções de domínio em respostas HTTP.

Toda regra de posse dos dados é aplicada nos casos de uso: um usuário só enxerga e altera estabelecimentos, categorias e produtos dos quais é dono (`ownerId` / `requesterId`).

## Endpoints

Todas as rotas (exceto `/health`) exigem `Authorization: Bearer <token>` emitido pelo Keycloak.

### Health

| Método | Rota |
|---|---|
| GET | `/health` |

### Estabelecimentos (`/establishments`)

| Método | Rota | Descrição |
|---|---|---|
| GET | `/establishments` | Lista estabelecimentos do usuário autenticado (paginado) |
| GET | `/establishments/:id` | Busca um estabelecimento por id |
| POST | `/establishments` | Cria um estabelecimento |
| PUT | `/establishments/:id` | Atualiza um estabelecimento |

### Categorias de produto (`/product-categories`)

| Método | Rota | Descrição |
|---|---|---|
| GET | `/product-categories?establishmentId=` | Lista categorias de um estabelecimento (paginado) |
| GET | `/product-categories/:id` | Busca uma categoria por id |
| POST | `/product-categories` | Cria uma categoria |
| PUT | `/product-categories/:id` | Atualiza uma categoria |

### Produtos (`/products`)

| Método | Rota | Descrição |
|---|---|---|
| GET | `/products` | Lista produtos (paginado, filtro opcional por nome) |
| GET | `/products/:id` | Busca um produto por id |
| POST | `/products` | Cria um produto |
| PUT | `/products/:id` | Atualiza um produto |
| DELETE | `/products/:id` | Desativa um produto |
| PATCH | `/products/:id/activate` | Reativa um produto |

Via Kong (gateway), as rotas ficam sob o prefixo `/catalog` (ex.: `http://localhost:8000/catalog/products`).

## Documentação interativa (Swagger)

Com o serviço no ar:

```
http://localhost:4001/api/docs
```

Suporta autenticação via Bearer token ou OAuth2 (Authorization Code + PKCE) contra o Keycloak.

## Variáveis de ambiente

Ver [`.env.example`](.env.example):

| Variável | Descrição |
|---|---|
| `PORT` | Porta HTTP do serviço (padrão `4001`) |
| `DATABASE_URL` | Connection string do Postgres (database `catalog`) |
| `RABBITMQ_URL` | Connection string do RabbitMQ |
| `KEYCLOAK_ISSUER` | Issuer esperado no token (deve bater com o `iss` do JWT) |
| `KEYCLOAK_JWKS_URI` | URL das chaves públicas do Keycloak, para validar assinatura do token |
| `KEYCLOAK_CLIENT_ID` | Client id configurado no realm `mini-food` |

## Como rodar

### Via Docker (recomendado)

A partir da raiz do monorepo:

```bash
bun run docker:up
```

O serviço sobe na porta `4001`, com Postgres e RabbitMQ já provisionados.

### Localmente

Suba a infra (Postgres, RabbitMQ, Keycloak, Kong):

```bash
bun run docker:dev:up
```

Instale dependências (raiz do monorepo) e rode o serviço:

```bash
bun install
bun run --cwd services/catalog dev
```

## Banco de dados (Prisma)

Modelos: `Establishment`, `EstablishmentAddress`, `ProductCategory`, `Product`, além das tabelas de suporte a mensageria confiável `OutboxEvent` e `InboxEvent`.

A partir da raiz do monorepo:

```bash
bun run prisma:generate:catalog       # gera o client Prisma
bun run prisma:migrate:dev:catalog    # cria/aplica migrations em dev
bun run prisma:studio:catalog         # abre o Prisma Studio
```

## Testes

```bash
bun run --cwd services/catalog test              # unitários
bun run --cwd services/catalog test:integration   # integração (repositórios Prisma)
bun run --cwd services/catalog test:e2e           # end-to-end (Playwright)
```

Ou, a partir da raiz:

```bash
bun run test:unit
```
