import { afterAll, afterEach, beforeAll, describe, expect, it } from 'bun:test';
import { config } from 'dotenv';

config({ path: `${import.meta.dir}/../../.env` });

import { EstablishmentPrismaRepository } from '../../src/infrastructure/repositories/establishment-prisma.repository';
import { EstablishmentNotFoundError } from '../../src/domain/errors/establishment.error';
import { EstablishmentEntity } from '../../src/domain/entities/establishment.entity';
import { PrismaService } from '../../src/infrastructure/prisma/prisma.service';
import { Address } from '../../src/domain/value-objects/address.vo';

const address = Address.create({
  street: 'Main St',
  number: '100',
  neighborhood: 'Center',
  city: 'Sao Paulo',
  state: 'SP',
  zipCode: '01000-000',
});

function buildEstablishment(overrides: Partial<{ id: string; ownerId: string }> = {}) {
  return EstablishmentEntity.create({
    id: overrides.id ?? crypto.randomUUID(),
    name: 'Mini Food',
    description: 'Best burgers in town',
    ownerId: overrides.ownerId ?? crypto.randomUUID(),
    address,
  });
}

describe('EstablishmentPrismaRepository (integration)', () => {
  const prismaService = new PrismaService();
  const repository = new EstablishmentPrismaRepository(prismaService);
  const createdIds: string[] = [];

  beforeAll(async () => {
    await prismaService.onModuleInit();
  });

  afterEach(async () => {
    if (createdIds.length === 0) return;

    await prismaService.establishmentAddress.deleteMany({
      where: { establishmentId: { in: createdIds } },
    });
    await prismaService.establishment.deleteMany({
      where: { id: { in: createdIds } },
    });
    createdIds.length = 0;
  });

  afterAll(async () => {
    await prismaService.onModuleDestroy();
  });

  describe('save + findById', () => {
    it('persists an establishment with its address and rehydrates it from the database', async () => {
      const establishment = buildEstablishment();
      createdIds.push(establishment.id);

      await repository.save(establishment);

      const found = await repository.findById(establishment.id);

      expect(found).not.toBeNull();
      expect(found).toBeInstanceOf(EstablishmentEntity);
      expect(found?.id).toBe(establishment.id);
      expect(found?.name).toBe('Mini Food');
      expect(found?.description).toBe('Best burgers in town');
      expect(found?.ownerId).toBe(establishment.ownerId);
      expect(found?.address.toJSON()).toEqual(address.toJSON());
      expect(found?.pullDomainEvents()).toEqual([]);
    });

    it('returns null when the establishment does not exist', async () => {
      const found = await repository.findById(crypto.randomUUID());

      expect(found).toBeNull();
    });
  });

  describe('findAll', () => {
    it('paginates establishments scoped to an owner', async () => {
      const ownerId = crypto.randomUUID();
      const establishments = [
        buildEstablishment({ ownerId }),
        buildEstablishment({ ownerId }),
        buildEstablishment({ ownerId }),
      ];

      for (const establishment of establishments) {
        createdIds.push(establishment.id);
        await repository.save(establishment);
      }

      const page1 = await repository.findAll({ ownerId, limit: 2, offset: 0 });
      const page2 = await repository.findAll({ ownerId, limit: 2, offset: 2 });

      expect(page1.total).toBe(3);
      expect(page1.data).toHaveLength(2);
      expect(page2.data).toHaveLength(1);
    });

    it('does not return establishments owned by other users', async () => {
      const ownerId = crypto.randomUUID();
      const otherOwnerId = crypto.randomUUID();

      const mine = buildEstablishment({ ownerId });
      const other = buildEstablishment({ ownerId: otherOwnerId });
      createdIds.push(mine.id, other.id);

      await repository.save(mine);
      await repository.save(other);

      const result = await repository.findAll({ ownerId, limit: 10, offset: 0 });

      expect(result.total).toBe(1);
      expect(result.data.map((e) => e.id)).toEqual([mine.id]);
    });
  });

  describe('update', () => {
    it('upserts the address and updates establishment fields', async () => {
      const establishment = buildEstablishment();
      createdIds.push(establishment.id);
      await repository.save(establishment);

      const newAddress = Address.create({
        street: 'Second St',
        number: '200',
        neighborhood: 'Uptown',
        city: 'Rio de Janeiro',
        state: 'RJ',
        zipCode: '02000-000',
      });
      const updated = establishment.update({ name: 'Mini Food Updated', address: newAddress });

      await repository.update(updated);

      const found = await repository.findById(establishment.id);

      expect(found?.name).toBe('Mini Food Updated');
      expect(found?.address.toJSON()).toEqual(newAddress.toJSON());
    });

    it('throws EstablishmentNotFoundError when updating a non-existent establishment', async () => {
      const establishment = buildEstablishment();

      await expect(repository.update(establishment)).rejects.toThrow(EstablishmentNotFoundError);
    });
  });
});
