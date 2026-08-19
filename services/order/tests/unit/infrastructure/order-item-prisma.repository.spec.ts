import { describe, expect, it, mock } from 'bun:test';

import { OrderItemPrismaRepository } from '@/infrastructure/repository/order-item-prisma.repository';
import type { PrismaService } from '@/infrastructure/prisma/prisma.service';
import { OrderItemEntity } from '@/domain/entities/order-item.entity';

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
  }> = {},
) {
  return {
    orderItem: {
      findUnique: overrides.findUnique ?? mock(async () => null),
      findMany: overrides.findMany ?? mock(async () => []),
      count: overrides.count ?? mock(async () => 0),
    },
  } as unknown as PrismaService;
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
});
