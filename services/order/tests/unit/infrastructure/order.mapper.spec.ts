import { describe, expect, it } from 'bun:test';

import { EstablishmentId } from '@/domain/value-objects/establishment-id.vo';
import { OrderEntity, OrderStatus } from '@/domain/entities/order.entity';
import { OrderMapper } from '@/infrastructure/persistence/order.mapper';
import { OrderItemEntity } from '@/domain/entities/order-item.entity';
import { CustomerId } from '@/domain/value-objects/customer-id.vo';
import { Quantity } from '@/domain/value-objects/quantity.vo';
import { Money } from '@/domain/value-objects/money.vo';

const rawItem = {
  id: 'item-1',
  name: 'Hamburger',
  quantity: 2,
  price: 1500n,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  itemId: 'catalog-item-1',
  orderId: 'order-1',
};

const rawOrder = {
  id: 'order-1',
  status: 'CREATED',
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  establishmentId: 'establishment-1',
  customerId: 'customer-1',
  items: [rawItem],
};

describe('OrderMapper', () => {
  describe('toDomain', () => {
    it('builds an OrderEntity with its items from a persistence row', () => {
      const entity = OrderMapper.toDomain(rawOrder);

      expect(entity).toBeInstanceOf(OrderEntity);
      expect(entity.id).toBe('order-1');
      expect(entity.status).toBe(OrderStatus.CREATED);
      expect(entity.establishmentIdString).toBe('establishment-1');
      expect(entity.customerIdString).toBe('customer-1');
      expect(entity.items).toHaveLength(1);
      expect(entity.items[0].name).toBe('Hamburger');
      expect(entity.items[0].quantityString).toBe('2');
    });
  });

  describe('toDomainList', () => {
    it('maps a list of persistence rows', () => {
      const secondOrder = {
        ...rawOrder,
        id: 'order-2',
        items: [{ ...rawItem, orderId: 'order-2' }],
      };

      const entities = OrderMapper.toDomainList([rawOrder, secondOrder]);

      expect(entities).toHaveLength(2);
      expect(entities[0].id).toBe('order-1');
      expect(entities[1].id).toBe('order-2');
    });
  });

  describe('toPersistence', () => {
    it('extracts primitive fields from an OrderEntity', () => {
      const item = OrderItemEntity.restore({
        id: 'item-1',
        name: 'Hamburger',
        quantity: Quantity.from(2),
        price: Money.fromCents(1500n),
        itemId: 'catalog-item-1',
        orderId: 'order-1',
        createdAt: rawOrder.createdAt,
        updatedAt: rawOrder.updatedAt,
      });

      const order = OrderEntity.restore({
        id: 'order-1',
        status: OrderStatus.CREATED,
        customerId: CustomerId.fromString('customer-1'),
        establishmentId: EstablishmentId.fromString('establishment-1'),
        items: [item],
        createdAt: rawOrder.createdAt,
        updatedAt: rawOrder.updatedAt,
      });

      expect(OrderMapper.toPersistence(order)).toEqual({
        order: {
          id: 'order-1',
          status: OrderStatus.CREATED,
          createdAt: rawOrder.createdAt,
          updatedAt: rawOrder.updatedAt,
          establishmentId: 'establishment-1',
          customerId: 'customer-1',
        },
        items: [
          {
            id: 'item-1',
            name: 'Hamburger',
            quantity: 2,
            price: 1500n,
            createdAt: rawOrder.createdAt,
            updatedAt: rawOrder.updatedAt,
            itemId: 'catalog-item-1',
            orderId: 'order-1',
          },
        ],
      });
    });
  });
});
