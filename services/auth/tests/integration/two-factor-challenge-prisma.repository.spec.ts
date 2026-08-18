import { afterAll, afterEach, beforeAll, describe, expect, it } from 'bun:test';
import { config } from 'dotenv';

config({ path: `${import.meta.dir}/../../.env` });

import { TwoFactorChallengePrismaRepository } from '@/infrastructure/repositories/two-factor-challenge-prisma.repository';
import { TwoFactorChallengeEntity } from '@/domain/entities/two-factor-challenge.entity';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';

function issueChallenge(userId: string) {
  const rawCode = '123456';
  return {
    rawCode,
    entity: TwoFactorChallengeEntity.issue({
      id: crypto.randomUUID(),
      userId,
      codeHash: `hash:${rawCode}`,
      encryptedRefreshToken: 'encrypted-refresh-token',
    }),
  };
}

describe('TwoFactorChallengePrismaRepository (integration)', () => {
  const prismaService = new PrismaService();
  const repository = new TwoFactorChallengePrismaRepository(prismaService);
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
      await prismaService.twoFactorChallenge.deleteMany({ where: { id: { in: createdIds } } });
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

  describe('create + findById', () => {
    it('persists a challenge and rehydrates it from the database', async () => {
      const userId = await createUser();
      const { entity, rawCode } = issueChallenge(userId);
      createdIds.push(entity.id);

      await repository.create(entity);

      const found = await repository.findById(entity.id);

      expect(found).not.toBeNull();
      expect(found).toBeInstanceOf(TwoFactorChallengeEntity);
      expect(found?.userId).toBe(userId);
      expect(found?.attempts).toBe(0);
      expect(found?.consumedAt).toBeUndefined();
      expect(found?.codeHash).toBe(`hash:${rawCode}`);
    });

    it('returns null when the challenge does not exist', async () => {
      const found = await repository.findById(crypto.randomUUID());

      expect(found).toBeNull();
    });
  });

  describe('update', () => {
    it('persists attempts and consumedAt after a successful verification', async () => {
      const userId = await createUser();
      const { entity, rawCode } = issueChallenge(userId);
      createdIds.push(entity.id);
      await repository.create(entity);

      const result = entity.verify(`hash:${rawCode}`);
      await repository.update(result.challenge);

      const found = await repository.findById(entity.id);

      expect(found?.consumedAt).toBeInstanceOf(Date);
    });

    it('persists an incremented attempt count after a failed verification', async () => {
      const userId = await createUser();
      const { entity } = issueChallenge(userId);
      createdIds.push(entity.id);
      await repository.create(entity);

      const result = entity.verify('hash:000000');
      await repository.update(result.challenge);

      const found = await repository.findById(entity.id);

      expect(found?.attempts).toBe(1);
      expect(found?.consumedAt).toBeUndefined();
    });
  });
});
