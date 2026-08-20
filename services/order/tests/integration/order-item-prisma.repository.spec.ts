import { afterAll, afterEach, beforeAll, describe, expect, it } from 'bun:test';
import { config } from 'dotenv';

config({ path: `${import.meta.dir}/../../.env` });

import { OrderItemPrismaRepository } from '@/infrastructure/repository/order-item-prisma.repository';
import { ORDER_ITEM_CREATION_TOKEN, OrderItemEntity } from '@/domain/entities/order-item.entity';
import { OutboxPrismaRepository } from '@/infrastructure/repository/outbox-prisma.repository';
import { OrderPrismaRepository } from '@/infrastructure/repository/order-prisma.repository';
import { EstablishmentId } from '@/domain/value-objects/establishment-id.vo';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import { CustomerId } from '@/domain/value-objects/customer-id.vo';
import { Quantity } from '@/domain/value-objects/quantity.vo';
import { OrderEntity } from '@/domain/entities/order.entity';
import { Money } from '@/domain/value-objects/money.vo';

describe('OrderItemPrismaRepository (integration)', () => {
  const prismaService = new PrismaService();
  const repository = new OrderItemPrismaRepository(prismaService);
  const orderRepository = new OrderPrismaRepository(
    prismaService,
    new OutboxPrismaRepository(prismaService),
  );
  const createdOrderIds: string[] = [];

  function buildItem(overrides: { name: string; priceCents: string; orderId: string }) {
    return OrderItemEntity.create(
      {
        id: crypto.randomUUID(),
        name: overrides.name,
        quantity: Quantity.from(1),
        price: Money.fromCents(overrides.priceCents),
        itemId: crypto.randomUUID(),
        orderId: overrides.orderId,
      },
      ORDER_ITEM_CREATION_TOKEN,
    );
  }

  async function createOrder(items?: OrderItemEntity[]): Promise<{ orderId: string }> {
    const orderId = items?.[0]?.orderId ?? crypto.randomUUID();

    const order = OrderEntity.create({
      id: orderId,
      customerId: CustomerId.fromString(crypto.randomUUID()),
      establishmentId: EstablishmentId.fromString(crypto.randomUUID()),
      items: items ?? [buildItem({ name: 'Hamburger', priceCents: '1000', orderId })],
    });

    await orderRepository.save(order);
    createdOrderIds.push(orderId);

    return { orderId };
  }

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

  describe('findById', () => {
    it('finds an order item persisted through the order aggregate', async () => {
      const orderId = crypto.randomUUID();
      const item = buildItem({ name: 'Fries', priceCents: '900', orderId });
      await createOrder([item]);

      const found = await repository.findById(item.id);

      expect(found).not.toBeNull();
      expect(found).toBeInstanceOf(OrderItemEntity);
      expect(found?.id).toBe(item.id);
      expect(found?.name).toBe('Fries');
      expect(found?.quantityString).toBe('1');
      expect(found?.price.toDecimal()).toBe('9.00');
      expect(found?.orderId).toBe(orderId);
    });

    it('returns null when the order item does not exist', async () => {
      const found = await repository.findById(crypto.randomUUID());

      expect(found).toBeNull();
    });
  });

  describe('findAll', () => {
    it('paginates order items filtered by orderId', async () => {
      const orderId = crypto.randomUUID();
      const items = [
        buildItem({ name: 'Fries', priceCents: '900', orderId }),
        buildItem({ name: 'Soda', priceCents: '500', orderId }),
      ];
      await createOrder(items);
      await createOrder();

      const result = await repository.findAll({ orderId, limit: 10, offset: 0 });

      expect(result.total).toBe(2);
      expect(result.data.every((i) => i.orderId === orderId)).toBe(true);
    });
  });
});
