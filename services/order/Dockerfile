FROM oven/bun:1-alpine

WORKDIR /app

# 1) Copia SÓ os manifests primeiro → camada de cache do Docker.
#    Mudou código mas não dependências? bun install não roda de novo.
COPY package.json bun.lock ./
COPY services/order/package.json services/order/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN bun install

# 2) Agora o código todo
COPY . .

WORKDIR /app/services/order

EXPOSE 4001

CMD ["bun", "run", "src/main.ts"]