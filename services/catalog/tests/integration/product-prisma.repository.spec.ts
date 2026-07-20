import { afterAll, afterEach, beforeAll, describe, expect, it } from 'bun:test';
import { config } from 'dotenv';

config({ path: `${import.meta.dir}/../../.env` });

import { ProductPrismaRepository } from '@/infrastructure/repositories/product-prisma.repository';
import { ProductNotFoundError } from '@/domain/errors/product.errors';
import { ProductEntity } from '@/domain/entities/product.entity';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import { Money } from '@/domain/value-objects/money.vo';

function buildProduct(overrides: Partial<{ id: string; categoryId: string }> = {}) {
  return ProductEntity.create({
    id: overrides.id ?? crypto.randomUUID(),
    name: 'Cheeseburger',
    price: Money.fromCents('2590'),
    categoryId: overrides.categoryId ?? crypto.randomUUID(),
  });
}

describe('ProductPrismaRepository (integration)', () => {
  const prismaService = new PrismaService();
  const repository = new ProductPrismaRepository(prismaService);
  const createdIds: string[] = [];
  const createdCategoryIds: string[] = [];
  const createdEstablishmentIds: string[] = [];

  async function createCategory(): Promise<string> {
    const establishment = await prismaService.establishment.create({
      data: {
        id: crypto.randomUUID(),
        name: 'Mini Food',
        ownerId: crypto.randomUUID(),
      },
    });
    createdEstablishmentIds.push(establishment.id);

    const category = await prismaService.productCategory.create({
      data: {
        id: crypto.randomUUID(),
        name: 'Burgers',
        establishmentId: establishment.id,
      },
    });
    createdCategoryIds.push(category.id);

    return category.id;
  }

  beforeAll(async () => {
    await prismaService.onModuleInit();
  });

  afterEach(async () => {
    if (createdIds.length > 0) {
      await prismaService.product.deleteMany({ where: { id: { in: createdIds } } });
      createdIds.length = 0;
    }

    if (createdCategoryIds.length > 0) {
      await prismaService.productCategory.deleteMany({
        where: { id: { in: createdCategoryIds } },
      });
      createdCategoryIds.length = 0;
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
    it('persists a product and rehydrates it from the database', async () => {
      const categoryId = await createCategory();
      const product = buildProduct({ categoryId });
      createdIds.push(product.id);

      await repository.save(product);

      const found = await repository.findById(product.id);

      expect(found).not.toBeNull();
      expect(found).toBeInstanceOf(ProductEntity);
      expect(found?.id).toBe(product.id);
      expect(found?.name).toBe('Cheeseburger');
      expect(found?.priceCents).toBe(2590n);
      expect(found?.categoryId).toBe(categoryId);
      expect(found?.isAvailable).toBe(true);
      expect(found?.pullDomainEvents()).toEqual([]);
    });

    it('returns null when the product does not exist', async () => {
      const found = await repository.findById(crypto.randomUUID());

      expect(found).toBeNull();
    });
  });

  describe('findAll', () => {
    it('paginates products filtered by name', async () => {
      const categoryId = await createCategory();
      const products = [
        ProductEntity.create({
          id: crypto.randomUUID(),
          name: 'Beef Burger',
          price: Money.fromCents('2590'),
          categoryId,
        }),
        ProductEntity.create({
          id: crypto.randomUUID(),
          name: 'Chicken Burger',
          price: Money.fromCents('2490'),
          categoryId,
        }),
        ProductEntity.create({
          id: crypto.randomUUID(),
          name: 'Fries',
          price: Money.fromCents('990'),
          categoryId,
        }),
      ];

      for (const product of products) {
        createdIds.push(product.id);
        await repository.save(product);
      }

      const result = await repository.findAll({ name: 'Burger', limit: 10, offset: 0 });

      expect(result.total).toBe(2);
      expect(result.data.map((p) => p.name).sort()).toEqual(['Beef Burger', 'Chicken Burger']);
    });
  });

  describe('update', () => {
    it('updates product fields', async () => {
      const categoryId = await createCategory();
      const product = buildProduct({ categoryId });
      createdIds.push(product.id);
      await repository.save(product);

      const updated = product.update({ name: 'Bacon Burger', price: Money.fromCents('2990') });

      await repository.update(updated);

      const found = await repository.findById(product.id);

      expect(found?.name).toBe('Bacon Burger');
      expect(found?.priceCents).toBe(2990n);
    });

    it('throws ProductNotFoundError when updating a non-existent product', async () => {
      const product = buildProduct();

      await expect(repository.update(product)).rejects.toThrow(ProductNotFoundError);
    });
  });

  describe('desactivate', () => {
    it('marks the product as unavailable', async () => {
      const categoryId = await createCategory();
      const product = buildProduct({ categoryId });
      createdIds.push(product.id);
      await repository.save(product);

      await repository.desactivate(product.id);

      const found = await repository.findById(product.id);

      expect(found?.isAvailable).toBe(false);
    });

    it('throws ProductNotFoundError when deactivating a non-existent product', async () => {
      await expect(repository.desactivate(crypto.randomUUID())).rejects.toThrow(
        ProductNotFoundError,
      );
    });
  });
});
