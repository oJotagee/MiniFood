import { afterAll, afterEach, beforeAll, describe, expect, it } from 'bun:test';
import { config } from 'dotenv';

config({ path: `${import.meta.dir}/../../.env` });

import { ProductCategoryPrismaRepository } from '@/infrastructure/repositories/product-category-prisma.repository';
import { ProductCategoryNotFoundError } from '@/domain/errors/product-category.errors';
import { ProductCategoryEntity } from '@/domain/entities/product-category.entity';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';

function buildCategory(overrides: Partial<{ id: string; establishmentId: string }> = {}) {
  return ProductCategoryEntity.create({
    id: overrides.id ?? crypto.randomUUID(),
    name: 'Burgers',
    establishmentId: overrides.establishmentId ?? crypto.randomUUID(),
  });
}

describe('ProductCategoryPrismaRepository (integration)', () => {
  const prismaService = new PrismaService();
  const repository = new ProductCategoryPrismaRepository(prismaService);
  const createdIds: string[] = [];
  const createdEstablishmentIds: string[] = [];

  async function createEstablishment(): Promise<string> {
    const establishment = await prismaService.establishment.create({
      data: {
        id: crypto.randomUUID(),
        name: 'Mini Food',
        ownerId: crypto.randomUUID(),
      },
    });
    createdEstablishmentIds.push(establishment.id);
    return establishment.id;
  }

  beforeAll(async () => {
    await prismaService.onModuleInit();
  });

  afterEach(async () => {
    if (createdIds.length > 0) {
      await prismaService.productCategory.deleteMany({
        where: { id: { in: createdIds } },
      });
      createdIds.length = 0;
    }

    if (createdEstablishmentIds.length > 0) {
      await prismaService.establishment.deleteMany({
        where: { id: { in: createdEstablishmentIds } },
      });
      createdEstablishmentIds.length = 0;
    }
  });

  afterAll(async () => {
    await prismaService.onModuleDestroy();
  });

  describe('save + findById', () => {
    it('persists a product category and rehydrates it from the database', async () => {
      const establishmentId = await createEstablishment();
      const category = buildCategory({ establishmentId });
      createdIds.push(category.id);

      await repository.save(category);

      const found = await repository.findById(category.id);

      expect(found).not.toBeNull();
      expect(found).toBeInstanceOf(ProductCategoryEntity);
      expect(found?.id).toBe(category.id);
      expect(found?.name).toBe('Burgers');
      expect(found?.establishmentId).toBe(establishmentId);
      expect(found?.pullDomainEvents()).toEqual([]);
    });

    it('returns null when the product category does not exist', async () => {
      const found = await repository.findById(crypto.randomUUID());

      expect(found).toBeNull();
    });
  });

  describe('findAll', () => {
    it('paginates product categories scoped to an establishment, filtered by name', async () => {
      const establishmentId = await createEstablishment();
      const categories = [
        ProductCategoryEntity.create({ id: crypto.randomUUID(), name: 'Burgers', establishmentId }),
        ProductCategoryEntity.create({
          id: crypto.randomUUID(),
          name: 'Burritos',
          establishmentId,
        }),
        ProductCategoryEntity.create({ id: crypto.randomUUID(), name: 'Drinks', establishmentId }),
      ];

      for (const category of categories) {
        createdIds.push(category.id);
        await repository.save(category);
      }

      const result = await repository.findAll({
        name: 'Bur',
        establishmentId,
        limit: 10,
        offset: 0,
      });

      expect(result.total).toBe(2);
      expect(result.data.map((c) => c.name).sort()).toEqual(['Burgers', 'Burritos']);
    });

    it('does not return product categories from other establishments', async () => {
      const establishmentId = await createEstablishment();
      const otherEstablishmentId = await createEstablishment();

      const mine = ProductCategoryEntity.create({
        id: crypto.randomUUID(),
        name: 'Burgers',
        establishmentId,
      });
      const other = ProductCategoryEntity.create({
        id: crypto.randomUUID(),
        name: 'Burgers',
        establishmentId: otherEstablishmentId,
      });
      createdIds.push(mine.id, other.id);

      await repository.save(mine);
      await repository.save(other);

      const result = await repository.findAll({
        name: '',
        establishmentId,
        limit: 10,
        offset: 0,
      });

      expect(result.total).toBe(1);
      expect(result.data.map((c) => c.id)).toEqual([mine.id]);
    });
  });

  describe('update', () => {
    it('updates product category fields', async () => {
      const establishmentId = await createEstablishment();
      const category = buildCategory({ establishmentId });
      createdIds.push(category.id);
      await repository.save(category);

      const updated = category.update({ name: 'Combos' });

      await repository.update(updated);

      const found = await repository.findById(category.id);

      expect(found?.name).toBe('Combos');
    });

    it('throws ProductCategoryNotFoundError when updating a non-existent category', async () => {
      const category = buildCategory();

      await expect(repository.update(category)).rejects.toThrow(ProductCategoryNotFoundError);
    });
  });
});
