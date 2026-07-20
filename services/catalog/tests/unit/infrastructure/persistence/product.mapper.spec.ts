import { describe, expect, it } from 'bun:test';

import { ProductMapper } from '@/infrastructure/persistence/product.mapper';
import { ProductEntity } from '@/domain/entities/product.entity';
import { Money } from '@/domain/value-objects/money.vo';

describe('ProductMapper', () => {
  describe('toDomain', () => {
    it('restores a product entity from persistence data', () => {
      const createdAt = new Date('2026-01-01T00:00:00.000Z');
      const updatedAt = new Date('2026-01-02T00:00:00.000Z');

      const product = ProductMapper.toDomain({
        id: 'product-1',
        name: 'Cheeseburger',
        description: 'Tasty burger',
        priceCents: 2590n,
        isAvailable: true,
        categoryId: 'category-1',
        createdAt,
        updatedAt,
      });

      expect(product).toBeInstanceOf(ProductEntity);
      expect(product.id).toBe('product-1');
      expect(product.name).toBe('Cheeseburger');
      expect(product.description).toBe('Tasty burger');
      expect(product.priceCents).toBe(2590n);
      expect(product.isAvailable).toBe(true);
      expect(product.categoryId).toBe('category-1');
      expect(product.createdAt).toBe(createdAt);
      expect(product.updatedAt).toBe(updatedAt);
      expect(product.pullDomainEvents()).toEqual([]);
    });

    it('maps a null description to undefined', () => {
      const product = ProductMapper.toDomain({
        id: 'product-1',
        name: 'Cheeseburger',
        description: null,
        priceCents: 2590n,
        isAvailable: true,
        categoryId: 'category-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(product.description).toBeUndefined();
    });
  });

  describe('toDomainList', () => {
    it('maps a list of raw records to entities', () => {
      const list = ProductMapper.toDomainList([
        {
          id: 'product-1',
          name: 'Cheeseburger',
          description: null,
          priceCents: 2590n,
          isAvailable: true,
          categoryId: 'category-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'product-2',
          name: 'Fries',
          description: null,
          priceCents: 990n,
          isAvailable: true,
          categoryId: 'category-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      expect(list).toHaveLength(2);
      expect(list[0]?.id).toBe('product-1');
      expect(list[1]?.id).toBe('product-2');
    });

    it('returns an empty array for an empty list', () => {
      expect(ProductMapper.toDomainList([])).toEqual([]);
    });
  });

  describe('toPersistence', () => {
    it('maps a product entity to persistence shape', () => {
      const product = ProductEntity.create({
        id: 'product-1',
        name: 'Cheeseburger',
        description: 'Tasty burger',
        price: Money.fromCents('2590'),
        categoryId: 'category-1',
      });

      const persistence = ProductMapper.toPersistence(product);

      expect(persistence).toEqual({
        id: 'product-1',
        name: 'Cheeseburger',
        description: 'Tasty burger',
        priceCents: 2590n,
        isAvailable: true,
        categoryId: 'category-1',
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      });
    });

    it('maps an undefined description to null', () => {
      const product = ProductEntity.create({
        id: 'product-1',
        name: 'Cheeseburger',
        description: undefined,
        price: Money.fromCents('2590'),
        categoryId: 'category-1',
      });

      const persistence = ProductMapper.toPersistence(product);

      expect(persistence.description).toBeNull();
    });

    it('round-trips through toPersistence and toDomain', () => {
      const product = ProductEntity.create({
        id: 'product-1',
        name: 'Cheeseburger',
        description: 'Tasty burger',
        price: Money.fromCents('2590'),
        categoryId: 'category-1',
      });

      const persistence = ProductMapper.toPersistence(product);
      const restored = ProductMapper.toDomain(persistence);

      expect(restored.id).toBe(product.id);
      expect(restored.name).toBe(product.name);
      expect(restored.priceCents).toBe(product.priceCents);
      expect(restored.categoryId).toBe(product.categoryId);
    });
  });
});
