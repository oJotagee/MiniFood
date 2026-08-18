import { describe, expect, it, mock } from 'bun:test';

import { OrderItemPrismaRepository } from '@/infrastructure/repository/order-item-prisma.repository';
import type { PrismaService } from '@/infrastructure/prisma/prisma.service';
import { OrderItemEntity } from '@/domain/entities/order-item.entity';
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

function makePrismaMock(
  overrides: Partial<{
    findUnique: ReturnType<typeof mock>;
    findMany: ReturnType<typeof mock>;
    count: ReturnType<typeof mock>;
    create: ReturnType<typeof mock>;
    update: ReturnType<typeof mock>;
  }> = {},
) {
  return {
    orderItem: {
      findUnique: overrides.findUnique ?? mock(async () => null),
      findMany: overrides.findMany ?? mock(async () => []),
      count: overrides.count ?? mock(async () => 0),
      create: overrides.create ?? mock(async () => undefined),
      update: overrides.update ?? mock(async () => undefined),
    },
  } as unknown as PrismaService;
}

function buildOrderItem(): OrderItemEntity {
  return OrderItemEntity.restore({
    id: 'item-1',
    name: 'Hamburger',
    quantity: Quantity.from(2),
    price: Money.fromCents(1500n),
    itemId: 'catalog-item-1',
    orderId: 'order-1',
    createdAt: rawItem.createdAt,
    updatedAt: rawItem.updatedAt,
  });
}

describe('OrderItemPrismaRepository', () => {
  describe('findById', () => {
    it('returns null when the order item does not exist', async () => {
      const prisma = makePrismaMock();
      const repository = new OrderItemPrismaRepository(prisma);

      const result = await repository.findById('missing');

      expect(result).toBeNull();
    });

    it('returns the mapped order item when found', async () => {
      const prisma = makePrismaMock({ findUnique: mock(async () => rawItem) });
      const repository = new OrderItemPrismaRepository(prisma);

      const result = await repository.findById('item-1');

      expect(result).toBeInstanceOf(OrderItemEntity);
      expect(result?.id).toBe('item-1');
    });
  });

  describe('findAll', () => {
    it('returns paginated, mapped order items', async () => {
      const prisma = makePrismaMock({
        findMany: mock(async () => [rawItem]),
        count: mock(async () => 1),
      });
      const repository = new OrderItemPrismaRepository(prisma);

      const result = await repository.findAll({ orderId: 'order-1', limit: 10, offset: 0 });

      expect(result.total).toBe(1);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe('item-1');
      expect(prisma.orderItem.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { orderId: 'order-1' }, take: 10, skip: 0 }),
      );
    });
  });

  describe('save', () => {
    it('persists the mapped order item', async () => {
      const prisma = makePrismaMock();
      const repository = new OrderItemPrismaRepository(prisma);

      await repository.save(buildOrderItem());

      expect(prisma.orderItem.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ id: 'item-1', quantity: 2, price: 1500n }),
      });
    });
  });

  describe('update', () => {
    it('updates an existing order item', async () => {
      const prisma = makePrismaMock({ findUnique: mock(async () => ({ id: 'item-1' })) });
      const repository = new OrderItemPrismaRepository(prisma);

      await repository.update(buildOrderItem());

      expect(prisma.orderItem.update).toHaveBeenCalledWith({
        where: { id: 'item-1' },
        data: expect.objectContaining({ id: 'item-1' }),
      });
    });

    it('throws when the order item does not exist', async () => {
      const prisma = makePrismaMock({ findUnique: mock(async () => null) });
      const repository = new OrderItemPrismaRepository(prisma);

      await expect(repository.update(buildOrderItem())).rejects.toThrow(
        'OrderItem with id item-1 not found',
      );

      expect(prisma.orderItem.update).not.toHaveBeenCalled();
    });
  });
});
