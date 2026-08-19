import { afterAll, afterEach, beforeAll, describe, expect, it } from 'bun:test';
import { config } from 'dotenv';

config({ path: `${import.meta.dir}/../../.env` });

import { ORDER_ITEM_CREATION_TOKEN, OrderItemEntity } from '@/domain/entities/order-item.entity';
import { OrderPrismaRepository } from '@/infrastructure/repository/order-prisma.repository';
import { EstablishmentId } from '@/domain/value-objects/establishment-id.vo';
import { OrderEntity, OrderStatus } from '@/domain/entities/order.entity';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import { CustomerId } from '@/domain/value-objects/customer-id.vo';
import { Quantity } from '@/domain/value-objects/quantity.vo';
import { Money } from '@/domain/value-objects/money.vo';

function buildOrder(overrides: Partial<{ id: string; customerId: string; establishmentId: string }> = {}) {
  const id = overrides.id ?? crypto.randomUUID();

  const item = OrderItemEntity.create(
    {
      id: crypto.randomUUID(),
      name: 'Hamburger',
      quantity: Quantity.from(2),
      price: Money.fromCents('1500'),
      itemId: crypto.randomUUID(),
      orderId: id,
    },
    ORDER_ITEM_CREATION_TOKEN,
  );

  return OrderEntity.create({
    id,
    customerId: CustomerId.fromString(overrides.customerId ?? crypto.randomUUID()),
    establishmentId: EstablishmentId.fromString(overrides.establishmentId ?? crypto.randomUUID()),
    items: [item],
  });
}

describe('OrderPrismaRepository (integration)', () => {
  const prismaService = new PrismaService();
  const repository = new OrderPrismaRepository(prismaService);
  const createdOrderIds: string[] = [];

  beforeAll(async () => {
    await prismaService.onModuleInit();
  });

  afterEach(async () => {
    if (createdOrderIds.length > 0) {
      await prismaService.orderItem.deleteMany({ where: { orderId: { in: createdOrderIds } } });
      await prismaService.order.deleteMany({ where: { id: { in: createdOrderIds } } });
      createdOrderIds.length = 0;
    }
  });

  afterAll(async () => {
    await prismaService.onModuleDestroy();
  });

  describe('save + findById', () => {
    it('persists an order and rehydrates it from the database', async () => {
      const order = buildOrder();
      createdOrderIds.push(order.id);

      await repository.save(order);

      const found = await repository.findById(order.id);

      expect(found).not.toBeNull();
      expect(found).toBeInstanceOf(OrderEntity);
      expect(found?.id).toBe(order.id);
      expect(found?.status).toBe(OrderStatus.CREATED);
      expect(found?.customerIdString).toBe(order.customerIdString);
      expect(found?.establishmentIdString).toBe(order.establishmentIdString);
      expect(found?.pullDomainEvents()).toEqual([]);
    });

    it('returns null when the order does not exist', async () => {
      const found = await repository.findById(crypto.randomUUID());

      expect(found).toBeNull();
    });
  });

  describe('findAll', () => {
    it('paginates orders filtered by establishment', async () => {
      const establishmentId = crypto.randomUUID();
      const otherEstablishmentId = crypto.randomUUID();

      const orders = [
        buildOrder({ establishmentId }),
        buildOrder({ establishmentId }),
        buildOrder({ establishmentId: otherEstablishmentId }),
      ];

      for (const order of orders) {
        createdOrderIds.push(order.id);
        await repository.save(order);
      }

      const result = await repository.findAll({ ownerId: establishmentId, limit: 10, offset: 0 });

      expect(result.total).toBe(2);
      expect(result.data.every((o) => o.establishmentIdString === establishmentId)).toBe(true);
    });

    it('does not return orders from another establishment', async () => {
      const establishmentId = crypto.randomUUID();
      const order = buildOrder({ establishmentId });
      createdOrderIds.push(order.id);
      await repository.save(order);

      const result = await repository.findAll({
        ownerId: crypto.randomUUID(),
        limit: 10,
        offset: 0,
      });

      expect(result.total).toBe(0);
      expect(result.data).toEqual([]);
    });
  });

  describe('update', () => {
    it('throws when updating a non-existent order', async () => {
      const order = buildOrder();

      await expect(repository.update(order)).rejects.toThrow('Order not found.');
    });
  });
});
