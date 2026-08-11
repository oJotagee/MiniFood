import { describe, expect, it } from 'bun:test';

import { OrderItemEntity } from '@/domain/entities/order-item.entity';
import { Quantity } from '@/domain/value-objects/quantity.vo';
import { Money } from '@/domain/value-objects/money.vo';
import {
  ItemIdNotFound,
  OrderIdNotFound,
  OrderItemNameCannotBeEmpty,
} from '@/domain/errors/order-item.errors';

function itemInput() {
  return {
    id: 'order-item-1',
    name: 'Hamburger',
    quantity: Quantity.from(2n),
    price: Money.fromCents(1500n),
    itemId: 'catalog-item-1',
    orderId: 'order-1',
  };
}

function createItem() {
  return OrderItemEntity.create(itemInput());
}

describe('OrderItemEntity', () => {
  it('creates an immutable price-and-quantity snapshot', () => {
    const item = createItem();

    expect(item.quantityString).toBe('2');
    expect(item.priceCents).toBe(1500n);
    expect(item.itemId).toBe('catalog-item-1');
  });

  it('updates allowed fields without changing identity or parent order', () => {
    const item = createItem();
    const updated = item.update({ name: 'Veggie hamburger', quantity: Quantity.from(3n) });

    expect(updated.name).toBe('Veggie hamburger');
    expect(updated.quantityString).toBe('3');
    expect(updated.id).toBe(item.id);
    expect(updated.orderId).toBe(item.orderId);
    expect(item.name).toBe('Hamburger');
  });

  it('restores without changing persisted timestamps', () => {
    const createdAt = new Date('2026-01-01T00:00:00.000Z');
    const updatedAt = new Date('2026-01-02T00:00:00.000Z');
    const item = OrderItemEntity.restore({
      id: 'order-item-1',
      name: 'Hamburger',
      quantity: Quantity.from(1n),
      price: Money.fromCents(1500n),
      itemId: 'catalog-item-1',
      orderId: 'order-1',
      createdAt,
      updatedAt,
    });

    expect(item.createdAt).toBe(createdAt);
    expect(item.updatedAt).toBe(updatedAt);
  });

  it('rejects missing business identifiers and a blank name', () => {
    expect(() => OrderItemEntity.create({ ...itemInput(), name: '' })).toThrow(
      OrderItemNameCannotBeEmpty,
    );
    expect(() =>
      OrderItemEntity.create({
        id: 'item-1',
        name: 'Hamburger',
        quantity: Quantity.from(1n),
        price: Money.fromCents(1500n),
        itemId: '',
        orderId: 'order-1',
      }),
    ).toThrow(ItemIdNotFound);
    expect(() =>
      OrderItemEntity.create({
        id: 'item-1',
        name: 'Hamburger',
        quantity: Quantity.from(1n),
        price: Money.fromCents(1500n),
        itemId: 'catalog-item-1',
        orderId: '',
      }),
    ).toThrow(OrderIdNotFound);
  });
});
