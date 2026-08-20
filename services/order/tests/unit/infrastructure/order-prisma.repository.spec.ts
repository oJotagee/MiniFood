import { describe, expect, it, mock } from 'bun:test';

import type { OutboxRepository } from '@/application/ports/outbox-repository.port';
import { OrderPrismaRepository } from '@/infrastructure/repository/order-prisma.repository';
import { EstablishmentId } from '@/domain/value-objects/establishment-id.vo';
import type { PrismaService } from '@/infrastructure/prisma/prisma.service';
import { OrderEntity, OrderStatus } from '@/domain/entities/order.entity';
import { OrderItemEntity } from '@/domain/entities/order-item.entity';
import { CustomerId } from '@/domain/value-objects/customer-id.vo';
import { Quantity } from '@/domain/value-objects/quantity.vo';
import { Money } from '@/domain/value-objects/money.vo';

function makeOutboxMock(): OutboxRepository {
  return {
    add: mock(async () => undefined),
    runInTransaction: mock(async (fn: (tx: unknown) => Promise<void>) => fn({})),
    findPending: mock(async () => []),
    markPublished: mock(async () => undefined),
    markFailed: mock(async () => undefined),
  };
}

const rawOrder = {
  id: 'order-1',
  status: 'CREATED',
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  establishmentId: 'establishment-1',
  customerId: 'customer-1',
  items: [
    {
      id: 'item-1',
      name: 'Hamburger',
      quantity: 2,
      price: 1500n,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      itemId: 'catalog-item-1',
      orderId: 'order-1',
    },
  ],
};

function makePrismaMock(
  overrides: Partial<{
    findUnique: ReturnType<typeof mock>;
    findMany: ReturnType<typeof mock>;
    count: ReturnType<typeof mock>;
    create: ReturnType<typeof mock>;
    update: ReturnType<typeof mock>;
    createMany: ReturnType<typeof mock>;
    upsert: ReturnType<typeof mock>;
  }> = {},
) {
  const order = {
    findUnique: overrides.findUnique ?? mock(async () => null),
    findMany: overrides.findMany ?? mock(async () => []),
    count: overrides.count ?? mock(async () => 0),
    create: overrides.create ?? mock(async () => undefined),
    update: overrides.update ?? mock(async () => undefined),
  };
  const orderItem = {
    createMany: overrides.createMany ?? mock(async () => undefined),
    upsert: overrides.upsert ?? mock(async () => undefined),
  };

  return {
    order,
    orderItem,
    $transaction: mock(async (callback: (tx: unknown) => Promise<unknown>) =>
      callback({ order, orderItem }),
    ),
  } as unknown as PrismaService;
}

function buildOrder(): OrderEntity {
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

  return OrderEntity.restore({
    id: 'order-1',
    status: OrderStatus.CREATED,
    customerId: CustomerId.fromString('customer-1'),
    establishmentId: EstablishmentId.fromString('establishment-1'),
    items: [item],
    createdAt: rawOrder.createdAt,
    updatedAt: rawOrder.updatedAt,
  });
}

describe('OrderPrismaRepository', () => {
  describe('findById', () => {
    it('returns null when the order does not exist', async () => {
      const prisma = makePrismaMock();
      const repository = new OrderPrismaRepository(prisma, makeOutboxMock());

      const result = await repository.findById('missing');

      expect(result).toBeNull();
    });

    it('returns the mapped order when found', async () => {
      const prisma = makePrismaMock({ findUnique: mock(async () => rawOrder) });
      const repository = new OrderPrismaRepository(prisma, makeOutboxMock());

      const result = await repository.findById('order-1');

      expect(result).toBeInstanceOf(OrderEntity);
      expect(result?.id).toBe('order-1');
    });
  });

  describe('findAll', () => {
    it('returns paginated, mapped orders', async () => {
      const prisma = makePrismaMock({
        findMany: mock(async () => [rawOrder]),
        count: mock(async () => 1),
      });
      const repository = new OrderPrismaRepository(prisma, makeOutboxMock());

      const result = await repository.findAll({ ownerId: 'establishment-1', limit: 10, offset: 0 });

      expect(result.total).toBe(1);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe('order-1');
      expect(prisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { establishmentId: 'establishment-1' },
          take: 10,
          skip: 0,
        }),
      );
    });
  });

  describe('save', () => {
    it('persists the mapped order and its items in the same transaction', async () => {
      const prisma = makePrismaMock();
      const repository = new OrderPrismaRepository(prisma, makeOutboxMock());

      await repository.save(buildOrder());

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(prisma.order.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ id: 'order-1', establishmentId: 'establishment-1' }),
      });
      expect(prisma.orderItem.createMany).toHaveBeenCalledWith({
        data: [expect.objectContaining({ id: 'item-1', orderId: 'order-1' })],
      });
    });

    it('writes the domain events raised by OrderEntity.create() to the outbox, inside the same transaction', async () => {
      const prisma = makePrismaMock();
      const outbox = makeOutboxMock();
      const repository = new OrderPrismaRepository(prisma, outbox);

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
      const created = OrderEntity.create({
        id: 'order-1',
        customerId: CustomerId.fromString('customer-1'),
        establishmentId: EstablishmentId.fromString('establishment-1'),
        items: [item],
      });

      await repository.save(created);

      expect(outbox.add).toHaveBeenCalledTimes(2);
      expect(outbox.add).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ type: 'order.created' }),
      );
      expect(outbox.add).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ type: 'order.approval.requested' }),
      );

      expect(created.pullDomainEvents()).toEqual([]);
    });
  });

  describe('update', () => {
    it('updates an existing order and upserts its items', async () => {
      const prisma = makePrismaMock({ findUnique: mock(async () => ({ id: 'order-1' })) });
      const repository = new OrderPrismaRepository(prisma, makeOutboxMock());

      await repository.update(buildOrder());

      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        data: expect.objectContaining({ id: 'order-1' }),
      });
      expect(prisma.orderItem.upsert).toHaveBeenCalledWith({
        where: { id: 'item-1' },
        create: expect.objectContaining({ id: 'item-1' }),
        update: expect.objectContaining({ id: 'item-1' }),
      });
    });

    it('throws when the order does not exist', async () => {
      const prisma = makePrismaMock({ findUnique: mock(async () => null) });
      const repository = new OrderPrismaRepository(prisma, makeOutboxMock());

      await expect(repository.update(buildOrder())).rejects.toThrow('Order not found.');

      expect(prisma.order.update).not.toHaveBeenCalled();
    });
  });
});
