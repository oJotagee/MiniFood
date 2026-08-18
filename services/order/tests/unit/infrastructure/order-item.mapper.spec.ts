import { describe, expect, it } from 'bun:test';

import { OrderItemMapper } from '@/infrastructure/persistence/order-item.mapper';
import { OrderItemEntity } from '@/domain/entities/order-item.entity';
import { Quantity } from '@/domain/value-objects/quantity.vo';
import { Money } from '@/domain/value-objects/money.vo';

const raw = {
  id: 'item-1',
  name: 'Hamburger',
  quantity: 2,
  price: 1500n,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-02T00:00:00.000Z'),
  itemId: 'catalog-item-1',
  orderId: 'order-1',
};

describe('OrderItemMapper', () => {
  describe('toDomain', () => {
    it('builds an OrderItemEntity from a persistence row', () => {
      const entity = OrderItemMapper.toDomain(raw);

      expect(entity).toBeInstanceOf(OrderItemEntity);
      expect(entity.id).toBe('item-1');
      expect(entity.name).toBe('Hamburger');
      expect(entity.quantityString).toBe('2');
      expect(entity.priceCents).toBe(1500n);
      expect(entity.itemId).toBe('catalog-item-1');
      expect(entity.orderId).toBe('order-1');
      expect(entity.createdAt).toBe(raw.createdAt);
      expect(entity.updatedAt).toBe(raw.updatedAt);
    });
  });

  describe('toDomainList', () => {
    it('maps a list of persistence rows', () => {
      const entities = OrderItemMapper.toDomainList([raw, { ...raw, id: 'item-2' }]);

      expect(entities).toHaveLength(2);
      expect(entities[0].id).toBe('item-1');
      expect(entities[1].id).toBe('item-2');
    });
  });

  describe('toPersistence', () => {
    it('extracts primitive fields from an OrderItemEntity', () => {
      const entity = OrderItemEntity.restore({
        id: 'item-1',
        name: 'Hamburger',
        quantity: Quantity.from(2),
        price: Money.fromCents(1500n),
        itemId: 'catalog-item-1',
        orderId: 'order-1',
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      });

      expect(OrderItemMapper.toPersistence(entity)).toEqual({
        id: 'item-1',
        name: 'Hamburger',
        quantity: 2,
        price: 1500n,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
        itemId: 'catalog-item-1',
        orderId: 'order-1',
      });
    });
  });
});
