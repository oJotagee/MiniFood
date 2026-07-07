import { describe, expect, it } from 'bun:test';

import { InvalidProductCategoryError } from '../../../src/domain/product-category/product-category.errors';
import { ProductCategoryEntity } from '../../../src/domain/product-category/product-category.entity';

describe('ProductCategoryEntity', () => {
  it('creates a valid product category', () => {
    const category = ProductCategoryEntity.create({
      id: 'category-1',
      operationId: 'operation-1',
      name: 'Burgers',
      establishmentId: 'establishment-1',
    });

    expect(category.id).toBe('category-1');
    expect(category.name).toBe('Burgers');
    expect(category.establishmentId).toBe('establishment-1');
  });

  it('updates category name without changing identity', () => {
    const category = ProductCategoryEntity.create({
      id: 'category-1',
      operationId: 'operation-1',
      name: 'Burgers',
      establishmentId: 'establishment-1',
    });

    const updated = category.update({ operationId: 'operation-2', name: 'Combos' });

    expect(updated.id).toBe(category.id);
    expect(updated.name).toBe('Combos');
    expect(updated.establishmentId).toBe(category.establishmentId);
  });

  it('rejects blank names', () => {
    expect(() =>
      ProductCategoryEntity.create({
        id: 'category-1',
        operationId: 'operation-1',
        name: '',
        establishmentId: 'establishment-1',
      }),
    ).toThrow(InvalidProductCategoryError);
  });

  it('records and pulls category creation events once', () => {
    const category = ProductCategoryEntity.create({
      id: 'category-1',
      operationId: 'operation-1',
      name: 'Burgers',
      establishmentId: 'establishment-1',
    });

    expect(category.pullDomainEvents()).toEqual([
      {
        type: 'product.category.created',
        occurredAt: category.createdAt,
        payload: {
          operationId: 'operation-1',
          categoryId: 'category-1',
          establishmentId: 'establishment-1',
          name: 'Burgers',
        },
      },
    ]);
    expect(category.pullDomainEvents()).toEqual([]);
  });

  it('records category update events', () => {
    const category = ProductCategoryEntity.create({
      id: 'category-1',
      operationId: 'operation-1',
      name: 'Burgers',
      establishmentId: 'establishment-1',
    });
    category.pullDomainEvents();

    const updated = category.update({ operationId: 'operation-2', name: 'Combos' });

    expect(updated.pullDomainEvents()).toEqual([
      {
        type: 'product.category.updated',
        occurredAt: updated.updatedAt,
        payload: {
          operationId: 'operation-2',
          categoryId: 'category-1',
          establishmentId: 'establishment-1',
          name: 'Combos',
        },
      },
    ]);
  });

  it('restores a category without recording domain events', () => {
    const createdAt = new Date('2026-01-01T00:00:00.000Z');
    const updatedAt = new Date('2026-01-02T00:00:00.000Z');

    const category = ProductCategoryEntity.restore({
      id: 'category-1',
      name: 'Burgers',
      establishmentId: 'establishment-1',
      createdAt,
      updatedAt,
    });

    expect(category.createdAt).toBe(createdAt);
    expect(category.updatedAt).toBe(updatedAt);
    expect(category.pullDomainEvents()).toEqual([]);
  });
});
