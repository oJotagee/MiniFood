import { describe, expect, it } from 'bun:test';

import { ProductEntity } from '../../../src/domain/product/product.entity';
import { Money } from '../../../src/domain/money/money.vo';
import {
  InvalidProductError,
  ProductAlreadyDeactivatedError,
} from '../../../src/domain/product/product.errors';

describe('ProductEntity', () => {
  it('creates a product with Money price', () => {
    const product = ProductEntity.create({
      id: 'product-1',
      operationId: 'operation-1',
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
      operationId: 'operation-1',
      name: 'Cheeseburger',
      establishmentId: 'establishment-1',
      price: Money.fromCents('2590'),
      categoryId: 'category-1',
    });

    const updated = product.update({ operationId: 'operation-2', price: Money.fromCents('2990') });

    expect(updated.priceCents).toBe(2990n);
    expect(product.priceCents).toBe(2590n);
  });

  it('deactivates a product once', () => {
    const product = ProductEntity.create({
      id: 'product-1',
      operationId: 'operation-1',
      name: 'Cheeseburger',
      establishmentId: 'establishment-1',
      price: Money.fromCents('2590'),
      categoryId: 'category-1',
    });

    const deactivated = product.deactivate({ operationId: 'operation-2' });

    expect(deactivated.isAvailable).toBe(false);
    expect(() => deactivated.deactivate({ operationId: 'operation-3' })).toThrow(
      ProductAlreadyDeactivatedError,
    );
  });

  it('rejects product without category', () => {
    expect(() =>
      ProductEntity.create({
        id: 'product-1',
        operationId: 'operation-1',
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
      operationId: 'operation-1',
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
          operationId: 'operation-1',
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
    const product = ProductEntity.restore({
      id: 'product-1',
      name: 'Cheeseburger',
      establishmentId: 'establishment-1',
      price: Money.fromCents('2590'),
      isAvailable: true,
      categoryId: 'category-1',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-02T00:00:00.000Z'),
    });

    expect(product.pullDomainEvents()).toEqual([]);
  });

  it('records only product deactivation event when deactivating', () => {
    const product = ProductEntity.create({
      id: 'product-1',
      operationId: 'operation-1',
      name: 'Cheeseburger',
      establishmentId: 'establishment-1',
      price: Money.fromCents('2590'),
      categoryId: 'category-1',
    });
    product.pullDomainEvents();

    const deactivated = product.deactivate({ operationId: 'operation-2' });
    const events = deactivated.pullDomainEvents();

    expect(events).toHaveLength(1);
    expect(events[0].type).toBe('product.deactivated');
  });
});
