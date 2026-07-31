import { afterAll, afterEach, beforeAll, describe, expect, it } from 'bun:test';
import { config } from 'dotenv';

config({ path: `${import.meta.dir}/../../.env` });

import { UserPrismaRepository } from '@/infrastructure/repositories/user-prisma.repository';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import { UserEntity } from '@/domain/entities/user.entity';
import { Email } from '@/domain/value-objects/email.vo';

function buildUser(overrides: Partial<{ id: string; email: string }> = {}) {
  return UserEntity.create({
    id: overrides.id ?? crypto.randomUUID(),
    name: 'Joao',
    email: Email.create({ value: overrides.email ?? `joao-${crypto.randomUUID()}@example.com` }),
    role: 'customer',
  });
}

describe('UserPrismaRepository (integration)', () => {
  const prismaService = new PrismaService();
  const repository = new UserPrismaRepository(prismaService);
  const createdIds: string[] = [];

  beforeAll(async () => {
    await prismaService.onModuleInit();
  });

  afterEach(async () => {
    if (createdIds.length === 0) return;

    await prismaService.user.deleteMany({ where: { id: { in: createdIds } } });
    createdIds.length = 0;
  });

  afterAll(async () => {
    await prismaService.onModuleDestroy();
  });

  describe('create + findById', () => {
    it('persists a user and rehydrates it from the database', async () => {
      const user = buildUser();
      createdIds.push(user.id);

      await repository.create(user);

      const found = await repository.findById(user.id);

      expect(found).not.toBeNull();
      expect(found).toBeInstanceOf(UserEntity);
      expect(found?.id).toBe(user.id);
      expect(found?.name).toBe('Joao');
      expect(found?.email.toString()).toBe(user.email.toString());
      expect(found?.role).toBe('customer');
      expect(found?.twoFactorEnabled).toBe(false);
      expect(found?.pullDomainEvents()).toEqual([]);
    });

    it('returns null when the user does not exist', async () => {
      const found = await repository.findById(crypto.randomUUID());

      expect(found).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('finds a user by email', async () => {
      const email = `joao-${crypto.randomUUID()}@example.com`;
      const user = buildUser({ email });
      createdIds.push(user.id);
      await repository.create(user);

      const found = await repository.findByEmail(email);

      expect(found?.id).toBe(user.id);
    });

    it('returns null when no user has that email', async () => {
      const found = await repository.findByEmail('ghost@example.com');

      expect(found).toBeNull();
    });
  });

  describe('update', () => {
    it('updates name, email and twoFactorEnabled', async () => {
      const user = buildUser();
      createdIds.push(user.id);
      await repository.create(user);

      const newEmail = `joao-updated-${crypto.randomUUID()}@example.com`;
      const updated = user
        .updateProfile({ name: 'Joao Silva', email: Email.create({ value: newEmail }) })
        .setTwoFactorEnabled(true);

      await repository.update(updated);

      const found = await repository.findById(user.id);

      expect(found?.name).toBe('Joao Silva');
      expect(found?.email.toString()).toBe(newEmail);
      expect(found?.twoFactorEnabled).toBe(true);
    });
  });
});
