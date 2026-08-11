import { describe, expect, it } from 'bun:test';

import { OrderItemEntity, ORDER_ITEM_CREATION_TOKEN } from '@/domain/entities/order-item.entity';
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
  return OrderItemEntity.create(itemInput(), ORDER_ITEM_CREATION_TOKEN);
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
    const updated = item.update(
      { name: 'Veggie hamburger', quantity: Quantity.from(3n) },
      ORDER_ITEM_CREATION_TOKEN,
    );

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
    expect(() =>
      OrderItemEntity.create({ ...itemInput(), name: '' }, ORDER_ITEM_CREATION_TOKEN),
    ).toThrow(OrderItemNameCannotBeEmpty);
    expect(() =>
      OrderItemEntity.create(
        {
          id: 'item-1',
          name: 'Hamburger',
          quantity: Quantity.from(1n),
          price: Money.fromCents(1500n),
          itemId: '',
          orderId: 'order-1',
        },
        ORDER_ITEM_CREATION_TOKEN,
      ),
    ).toThrow(ItemIdNotFound);
    expect(() =>
      OrderItemEntity.create(
        {
          id: 'item-1',
          name: 'Hamburger',
          quantity: Quantity.from(1n),
          price: Money.fromCents(1500n),
          itemId: 'catalog-item-1',
          orderId: '',
        },
        ORDER_ITEM_CREATION_TOKEN,
      ),
    ).toThrow(OrderIdNotFound);
  });

  it('rejects create/update without the aggregate-root creation token', () => {
    const bogusToken = Symbol('not-the-real-token') as typeof ORDER_ITEM_CREATION_TOKEN;

    expect(() => OrderItemEntity.create(itemInput(), bogusToken)).toThrow(
      'Order items can only be created or updated through the Order aggregate root.',
    );

    const item = createItem();
    expect(() => item.update({ name: 'Hacked' }, bogusToken)).toThrow(
      'Order items can only be created or updated through the Order aggregate root.',
    );
  });
});
