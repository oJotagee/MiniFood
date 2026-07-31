import { afterAll, afterEach, beforeAll, describe, expect, it } from 'bun:test';
import { config } from 'dotenv';

config({ path: `${import.meta.dir}/../../.env` });

import { PasswordResetTokenPrismaRepository } from '@/infrastructure/repositories/password-reset-token-prisma.repository';
import { PasswordResetTokenEntity } from '@/domain/entities/password-reset-token.entity';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';

describe('PasswordResetTokenPrismaRepository (integration)', () => {
  const prismaService = new PrismaService();
  const repository = new PasswordResetTokenPrismaRepository(prismaService);
  const createdIds: string[] = [];
  const createdUserIds: string[] = [];

  async function createUser(): Promise<string> {
    const user = await prismaService.user.create({
      data: {
        id: crypto.randomUUID(),
        name: 'Joao',
        email: `joao-${crypto.randomUUID()}@example.com`,
        role: 'CUSTOMER',
      },
    });
    createdUserIds.push(user.id);

    return user.id;
  }

  beforeAll(async () => {
    await prismaService.onModuleInit();
  });

  afterEach(async () => {
    if (createdIds.length > 0) {
      await prismaService.passwordResetToken.deleteMany({ where: { id: { in: createdIds } } });
      createdIds.length = 0;
    }

    if (createdUserIds.length > 0) {
      await prismaService.user.deleteMany({ where: { id: { in: createdUserIds } } });
      createdUserIds.length = 0;
    }
  });

  afterAll(async () => {
    await prismaService.onModuleDestroy();
  });

  describe('create + findByTokenHash', () => {
    it('persists a token and rehydrates it from the database', async () => {
      const userId = await createUser();
      const { entity, rawToken } = PasswordResetTokenEntity.issue({
        id: crypto.randomUUID(),
        userId,
      });
      createdIds.push(entity.id);

      await repository.create(entity);

      const found = await repository.findByTokenHash(PasswordResetTokenEntity.hash(rawToken));

      expect(found).not.toBeNull();
      expect(found).toBeInstanceOf(PasswordResetTokenEntity);
      expect(found?.id).toBe(entity.id);
      expect(found?.userId).toBe(userId);
      expect(found?.usedAt).toBeUndefined();
    });

    it('returns null when the token hash does not exist', async () => {
      const found = await repository.findByTokenHash('unknown-hash');

      expect(found).toBeNull();
    });
  });

  describe('markAsUsed', () => {
    it('persists the consumed timestamp', async () => {
      const userId = await createUser();
      const { entity } = PasswordResetTokenEntity.issue({ id: crypto.randomUUID(), userId });
      createdIds.push(entity.id);
      await repository.create(entity);

      await repository.markAsUsed(entity.markAsUsed());

      const found = await repository.findByTokenHash(entity.tokenHash);

      expect(found?.usedAt).toBeInstanceOf(Date);
    });
  });
});
