import { describe, expect, it } from 'bun:test';

import { OrderItemDoesNotBelongToOrderError } from '@/domain/errors/order-item.errors';
import { OrderEntity, OrderStatus } from '@/domain/entities/order.entity';
import { OrderItemEntity } from '@/domain/entities/order-item.entity';
import { EstablishmentId } from '@/domain/value-objects/establishment-id.vo';
import { CustomerId } from '@/domain/value-objects/customer-id.vo';
import { Quantity } from '@/domain/value-objects/quantity.vo';
import { Money } from '@/domain/value-objects/money.vo';
import {
  InvalidOrderStatusError,
  OrderMustHaveItemsError,
  OrderNotFoundError,
  OrderStatusEmptyError,
} from '@/domain/errors/order.erros';

const orderId = 'order-1';

function item(id = 'item-1', itemOrderId = orderId, quantity = 1): OrderItemEntity {
  return OrderItemEntity.restore({
    id,
    name: 'Hamburger',
    quantity: Quantity.from(quantity),
    price: Money.fromCents(1500n),
    itemId: 'catalog-item-1',
    orderId: itemOrderId,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  });
}

function order(items = [item()]): OrderEntity {
  return OrderEntity.create({
    id: orderId,
    customerId: CustomerId.fromString('customer-1'),
    establishmentId: EstablishmentId.fromString('establishment-1'),
    items,
  });
}

describe('OrderEntity', () => {
  it('creates an order with CREATED status and records a creation event', () => {
    const entity = order([item('item-1', orderId, 2)]);

    expect(entity.status).toBe(OrderStatus.CREATED);
    expect(entity.customerIdString).toBe('customer-1');
    expect(entity.establishmentIdString).toBe('establishment-1');
    expect(entity.pullDomainEvents()).toEqual([
      {
        type: 'order.created',
        occurredAt: entity.createdAt,
        payload: {
          orderId: 'order-1',
          customerId: 'customer-1',
          establishmentId: 'establishment-1',
          totalAmountCents: '3000',
        },
      },
    ]);
    expect(entity.pullDomainEvents()).toEqual([]);
  });

  it('calculates event totals in cents using the item quantity', () => {
    const entity = order([item('item-1', orderId, 2), item('item-2', orderId, 3)]);

    const [event] = entity.pullDomainEvents();

    expect(event.payload.totalAmountCents).toBe('7500');
  });

  it('restores an order without recording domain events', () => {
    const createdAt = new Date('2026-01-01T00:00:00.000Z');
    const updatedAt = new Date('2026-01-02T00:00:00.000Z');

    const entity = OrderEntity.restore({
      id: orderId,
      status: OrderStatus.CONFIRMED,
      customerId: CustomerId.fromString('customer-1'),
      establishmentId: EstablishmentId.fromString('establishment-1'),
      items: [item()],
      createdAt,
      updatedAt,
    });

    expect(entity.status).toBe(OrderStatus.CONFIRMED);
    expect(entity.createdAt).toBe(createdAt);
    expect(entity.updatedAt).toBe(updatedAt);
    expect(entity.pullDomainEvents()).toEqual([]);
  });

  describe('aggregate boundary', () => {
    it('does not expose its internal items array', () => {
      const entity = order();
      const exposedItems = entity.items;

      (exposedItems as OrderItemEntity[]).pop();

      expect(entity.items).toHaveLength(1);
    });

    it('copies the items supplied during creation', () => {
      const suppliedItems = [item()];
      const entity = order(suppliedItems);

      suppliedItems.pop();

      expect(entity.items).toHaveLength(1);
    });

    it('only accepts items that belong to the order when adding', () => {
      const entity = order();

      expect(() => entity.addItem(item('item-2', 'another-order'))).toThrow(
        OrderItemDoesNotBelongToOrderError,
      );
    });

    it('adds an item that belongs to the order', () => {
      const entity = order();

      entity.addItem(item('item-2', orderId));

      expect(entity.items).toHaveLength(2);
    });

    it('updates an item through the aggregate root', () => {
      const entity = order();

      entity.updateItem('item-1', { name: 'Veggie hamburger' });

      expect(entity.items[0].name).toBe('Veggie hamburger');
    });

    it('rejects updating an item that does not belong to the order', () => {
      const entity = order();

      expect(() => entity.updateItem('unknown-item', { name: 'x' })).toThrow(
        OrderItemDoesNotBelongToOrderError,
      );
    });
  });

  describe('validate', () => {
    it('rejects a blank id', () => {
      expect(() =>
        OrderEntity.restore({
          id: '',
          status: OrderStatus.CREATED,
          customerId: CustomerId.fromString('customer-1'),
          establishmentId: EstablishmentId.fromString('establishment-1'),
          items: [item('item-1', orderId)],
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      ).toThrow(OrderNotFoundError);
    });

    it('rejects a blank status', () => {
      expect(() =>
        OrderEntity.restore({
          id: orderId,
          status: '' as OrderStatus,
          customerId: CustomerId.fromString('customer-1'),
          establishmentId: EstablishmentId.fromString('establishment-1'),
          items: [item()],
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      ).toThrow(OrderStatusEmptyError);
    });

    it('rejects an invalid status', () => {
      expect(() =>
        OrderEntity.restore({
          id: orderId,
          status: 'NOT_A_STATUS' as OrderStatus,
          customerId: CustomerId.fromString('customer-1'),
          establishmentId: EstablishmentId.fromString('establishment-1'),
          items: [item()],
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      ).toThrow(InvalidOrderStatusError);
    });

    it('rejects an order with no items', () => {
      expect(() => order([])).toThrow(OrderMustHaveItemsError);
    });

    it('rejects an order whose item does not belong to it', () => {
      expect(() => order([item('item-1', 'another-order')])).toThrow(
        OrderItemDoesNotBelongToOrderError,
      );
    });
  });
});
