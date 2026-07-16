import { describe, expect, it } from 'bun:test';

import { ProductEntity } from '@/domain/entities/product.entity';
import { Money } from '@/domain/value-objects/money.vo';
import {
  InvalidProductError,
  ProductAlreadyDeactivatedError,
} from '@/domain/errors/product.errors';

describe('ProductEntity', () => {
  it('creates a product with Money price', () => {
    const product = ProductEntity.create({
      id: 'product-1',
      name: 'Cheeseburger',
      establishmentId: 'establishment-1',
      price: Money.fromCents('2590'),
      categoryId: 'category-1',
    });

    expect(product.priceCents).toBe(2590n);
    expect(product.isAvailable).toBe(true);
  });

  it('updates product price using Money', () => {
    const product = ProductEntity.create({
      id: 'product-1',
      name: 'Cheeseburger',
      establishmentId: 'establishment-1',
      price: Money.fromCents('2590'),
      categoryId: 'category-1',
    });

    const updated = product.update({ price: Money.fromCents('2990') });

    expect(updated.priceCents).toBe(2990n);
    expect(product.priceCents).toBe(2590n);
  });

  it('deactivates a product once', () => {
    const product = ProductEntity.create({
      id: 'product-1',
      name: 'Cheeseburger',
      establishmentId: 'establishment-1',
      price: Money.fromCents('2590'),
      categoryId: 'category-1',
    });

    const deactivated = product.deactivate();

    expect(deactivated.isAvailable).toBe(false);
    expect(() => deactivated.deactivate()).toThrow(
      ProductAlreadyDeactivatedError,
    );
  });

  it('rejects product without category', () => {
    expect(() =>
      ProductEntity.create({
        id: 'product-1',
        name: 'Cheeseburger',
        establishmentId: 'establishment-1',
        price: Money.fromCents('2590'),
        categoryId: '',
      }),
    ).toThrow(InvalidProductError);
  });

  it('records and pulls product creation events once', () => {
    const product = ProductEntity.create({
      id: 'product-1',
      name: 'Cheeseburger',
      establishmentId: 'establishment-1',
      price: Money.fromCents('2590'),
      categoryId: 'category-1',
    });

    expect(product.pullDomainEvents()).toEqual([
      {
        type: 'product.created',
        occurredAt: product.createdAt,
        payload: {
          productId: 'product-1',
          establishmentId: 'establishment-1',
          productCategoryId: 'category-1',
          name: 'Cheeseburger',
          description: undefined,
          priceCents: '2590',
          isAvailable: true,
        },
      },
    ]);
    expect(product.pullDomainEvents()).toEqual([]);
  });

  it('restores a product without recording domain events', () => {
    const createdAt = new Date('2026-01-01T00:00:00.000Z');
    const updatedAt = new Date('2026-01-02T00:00:00.000Z');

    const product = ProductEntity.restore({
      id: 'product-1',
      name: 'Cheeseburger',
      establishmentId: 'establishment-1',
      price: Money.fromCents('2590'),
      isAvailable: true,
      categoryId: 'category-1',
      createdAt,
      updatedAt,
    });

    expect(product.createdAt).toBe(createdAt);
    expect(product.updatedAt).toBe(updatedAt);
    expect(product.pullDomainEvents()).toEqual([]);
  });

  it('records only product deactivation event when deactivating', () => {
    const product = ProductEntity.create({
      id: 'product-1',
      name: 'Cheeseburger',
      establishmentId: 'establishment-1',
      price: Money.fromCents('2590'),
      categoryId: 'category-1',
    });
    product.pullDomainEvents();

    const deactivated = product.deactivate();
    const events = deactivated.pullDomainEvents();

    expect(events).toHaveLength(1);
    expect(events[0].type).toBe('product.deactivated');
  });
});
