import { describe, expect, it } from 'bun:test';

import { ProductCategoryMapper } from '@/infrastructure/persistence/product-category.mapper';
import { ProductCategoryEntity } from '@/domain/entities/product-category.entity';

describe('ProductCategoryMapper', () => {
  describe('toDomain', () => {
    it('restores a product category entity from persistence data', () => {
      const createdAt = new Date('2026-01-01T00:00:00.000Z');
      const updatedAt = new Date('2026-01-02T00:00:00.000Z');

      const category = ProductCategoryMapper.toDomain({
        id: 'category-1',
        name: 'Burgers',
        establishmentId: 'establishment-1',
        createdAt,
        updatedAt,
      });

      expect(category).toBeInstanceOf(ProductCategoryEntity);
      expect(category.id).toBe('category-1');
      expect(category.name).toBe('Burgers');
      expect(category.establishmentId).toBe('establishment-1');
      expect(category.createdAt).toBe(createdAt);
      expect(category.updatedAt).toBe(updatedAt);
      expect(category.pullDomainEvents()).toEqual([]);
    });
  });

  describe('toDomainList', () => {
    it('maps a list of raw records to entities', () => {
      const list = ProductCategoryMapper.toDomainList([
        {
          id: 'category-1',
          name: 'Burgers',
          establishmentId: 'establishment-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'category-2',
          name: 'Combos',
          establishmentId: 'establishment-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      expect(list).toHaveLength(2);
      expect(list[0]?.id).toBe('category-1');
      expect(list[1]?.id).toBe('category-2');
    });

    it('returns an empty array for an empty list', () => {
      expect(ProductCategoryMapper.toDomainList([])).toEqual([]);
    });
  });

  describe('toPersistence', () => {
    it('maps a product category entity to persistence shape', () => {
      const category = ProductCategoryEntity.create({
        id: 'category-1',
        name: 'Burgers',
        establishmentId: 'establishment-1',
      });

      const persistence = ProductCategoryMapper.toPersistence(category);

      expect(persistence).toEqual({
        id: 'category-1',
        name: 'Burgers',
        establishmentId: 'establishment-1',
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      });
    });

    it('round-trips through toPersistence and toDomain', () => {
      const category = ProductCategoryEntity.create({
        id: 'category-1',
        name: 'Burgers',
        establishmentId: 'establishment-1',
      });

      const persistence = ProductCategoryMapper.toPersistence(category);
      const restored = ProductCategoryMapper.toDomain(persistence);

      expect(restored.id).toBe(category.id);
      expect(restored.name).toBe(category.name);
      expect(restored.establishmentId).toBe(category.establishmentId);
    });
  });
});
