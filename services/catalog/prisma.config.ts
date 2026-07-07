import { config } from 'dotenv';

import { defineConfig } from 'prisma/config';

config({
  path: process.cwd().endsWith('/services/catalog') ? '.env' : 'services/catalog/.env',
});

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'prisma/seed.ts',
  },
  datasource: {
    url: process.env['DATABASE_URL'],
  },
});
