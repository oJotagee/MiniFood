import { afterAll, afterEach, beforeAll, describe, expect, it } from 'bun:test';
import { config } from 'dotenv';

config({ path: `${import.meta.dir}/../../.env` });

import { OrderItemPrismaRepository } from '@/infrastructure/repository/order-item-prisma.repository';
import { ORDER_ITEM_CREATION_TOKEN, OrderItemEntity } from '@/domain/entities/order-item.entity';
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
  const orderRepository = new OrderPrismaRepository(prismaService);
  const createdOrderIds: string[] = [];

  async function createOrder(): Promise<string> {
    const orderId = crypto.randomUUID();

    const item = OrderItemEntity.create(
      {
        id: crypto.randomUUID(),
        name: 'Hamburger',
        quantity: Quantity.from(1),
        price: Money.fromCents('1000'),
        itemId: crypto.randomUUID(),
        orderId,
      },
      ORDER_ITEM_CREATION_TOKEN,
    );

    const order = OrderEntity.create({
      id: orderId,
      customerId: CustomerId.fromString(crypto.randomUUID()),
      establishmentId: EstablishmentId.fromString(crypto.randomUUID()),
      items: [item],
    });

    await orderRepository.save(order);
    createdOrderIds.push(orderId);

    return orderId;
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

  describe('save + findById', () => {
    it('persists an order item and rehydrates it from the database', async () => {
      const orderId = await createOrder();
      const item = OrderItemEntity.create(
        {
          id: crypto.randomUUID(),
          name: 'Fries',
          quantity: Quantity.from(1),
          price: Money.fromCents('900'),
          itemId: crypto.randomUUID(),
          orderId,
        },
        ORDER_ITEM_CREATION_TOKEN,
      );

      await repository.save(item);

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
      const orderId = await createOrder();
      const otherOrderId = await createOrder();

      const items = [
        OrderItemEntity.create(
          {
            id: crypto.randomUUID(),
            name: 'Fries',
            quantity: Quantity.from(1),
            price: Money.fromCents('900'),
            itemId: crypto.randomUUID(),
            orderId,
          },
          ORDER_ITEM_CREATION_TOKEN,
        ),
        OrderItemEntity.create(
          {
            id: crypto.randomUUID(),
            name: 'Soda',
            quantity: Quantity.from(1),
            price: Money.fromCents('500'),
            itemId: crypto.randomUUID(),
            orderId,
          },
          ORDER_ITEM_CREATION_TOKEN,
        ),
        OrderItemEntity.create(
          {
            id: crypto.randomUUID(),
            name: 'Salad',
            quantity: Quantity.from(1),
            price: Money.fromCents('700'),
            itemId: crypto.randomUUID(),
            orderId: otherOrderId,
          },
          ORDER_ITEM_CREATION_TOKEN,
        ),
      ];

      for (const item of items) {
        await repository.save(item);
      }

      const result = await repository.findAll({ orderId, limit: 10, offset: 0 });

      // 2 itens criados aqui + 1 item criado junto com o pedido em createOrder()
      expect(result.total).toBe(3);
      expect(result.data.every((i) => i.orderId === orderId)).toBe(true);
    });
  });

  describe('update', () => {
    it('updates order item fields', async () => {
      const orderId = await createOrder();
      const item = OrderItemEntity.create(
        {
          id: crypto.randomUUID(),
          name: 'Fries',
          quantity: Quantity.from(1),
          price: Money.fromCents('900'),
          itemId: crypto.randomUUID(),
          orderId,
        },
        ORDER_ITEM_CREATION_TOKEN,
      );
      await repository.save(item);

      const updated = item.update(
        { name: 'Large Fries', price: Money.fromCents('1200') },
        ORDER_ITEM_CREATION_TOKEN,
      );

      await repository.update(updated);

      const found = await repository.findById(item.id);

      expect(found?.name).toBe('Large Fries');
      expect(found?.price.toDecimal()).toBe('12.00');
    });

    it('throws when updating a non-existent order item', async () => {
      const orderId = await createOrder();
      const item = OrderItemEntity.create(
        {
          id: crypto.randomUUID(),
          name: 'Fries',
          quantity: Quantity.from(1),
          price: Money.fromCents('900'),
          itemId: crypto.randomUUID(),
          orderId,
        },
        ORDER_ITEM_CREATION_TOKEN,
      );

      await expect(repository.update(item)).rejects.toThrow(
        `OrderItem with id ${item.id} not found`,
      );
    });
  });
});
