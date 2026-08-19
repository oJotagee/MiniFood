# Order Service

Serviço responsável pelos pedidos do MiniFood: criação de pedidos, itens do pedido e consulta. Construído em NestJS (runtime Bun), seguindo Clean Architecture.

## Arquitetura

```
src/
├── domain/          # entidades, value objects, erros e eventos de domínio
├── application/      # casos de uso e portas (interfaces de repositório)
├── infrastructure/   # Prisma, repositórios, autenticação JWT
└── presentation/      # controllers, DTOs e filtros HTTP
```

- **Domain**: `OrderEntity` é o agregado raiz; `OrderItemEntity` só pode ser criado através dele (token de criação `ORDER_ITEM_CREATION_TOKEN`), nunca isoladamente. `Money`, `Quantity`, `CustomerId` e `EstablishmentId` como value objects. Erros de domínio próprios (`OrderNotFoundError`, `InvalidOrderTransitionError`, `OrderMustHaveItemsError`, etc.) e eventos de domínio (`order.created`, `order.confirmed`, `order.cancelled`).
- **Application**: um caso de uso por operação (`create-order`, `find-all-orders`, `update-order-item`, etc.), dependendo apenas de portas (`OrderRepository`, `OrderItemRepository`), nunca de implementações concretas.
- **Infrastructure**: repositórios Prisma, mappers entidade↔persistência, `PrismaService` e o guard de autenticação JWT (`JwtAuthGuard`), que valida o token contra o Keycloak. `OrderPrismaRepository.save`/`update` persistem `Order` e seus `OrderItem` na mesma transação (`$transaction`) — raiz e filhos são gravados atomicamente. `OrderItemRepository` é somente leitura: como `OrderItem` não é um agregado independente, toda escrita passa pelo `OrderRepository`.
- **Presentation**: controllers REST, DTOs de entrada/saída (validados com `class-validator`) e um filtro global (`DomainExceptionFilter`) que traduz exceções de domínio em respostas HTTP.

Toda regra de posse dos dados é aplicada nos casos de uso: a identidade do usuário vem sempre do token (`req.user.userId`), nunca do corpo da requisição.

## Endpoints

Todas as rotas (exceto `/health`) exigem `Authorization: Bearer <token>` emitido pelo Keycloak e o papel (`role`) `customer`.

### Health

| Método | Rota |
|---|---|
| GET | `/health` |

### Pedidos (`/orders`)

| Método | Rota | Descrição |
|---|---|---|
| GET | `/orders` | Lista pedidos do usuário autenticado (paginado) |
| GET | `/orders/:id` | Busca um pedido por id |
| POST | `/orders` | Cria um pedido com seus itens |

### Itens do pedido (`/orders/:orderId/items`)

| Método | Rota | Descrição |
|---|---|---|
| GET | `/orders/:orderId/items` | Lista itens de um pedido (paginado) |
| GET | `/orders/:orderId/items/:id` | Busca um item por id |
| PUT | `/orders/:orderId/items/:id` | Atualiza um item do pedido |

Via Kong (gateway), as rotas ficam sob o prefixo `/order` (ex.: `http://localhost:8000/order/orders`).

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
| `PORT` | Porta HTTP do serviço (o `.env.example` traz `4002`, mas o código usa `4001` como padrão — confira o valor efetivo antes de subir) |
| `DATABASE_URL` | Connection string do Postgres (database `order`) |
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
bun run --cwd services/order dev
```

## Banco de dados (Prisma)

Modelos: `Order`, `OrderItem`.

A partir da raiz do monorepo:

```bash
bun run prisma:generate:order       # gera o client Prisma
bun run prisma:migrate:dev:order    # cria/aplica migrations em dev
bun run prisma:studio:order         # abre o Prisma Studio
```

## Testes

```bash
bun run --cwd services/order test              # unitários
bun run --cwd services/order test:integration   # integração (repositórios Prisma)
bun run --cwd services/order test:e2e           # end-to-end (Playwright)
```

Ou, a partir da raiz:

```bash
bun run test:unit
```
