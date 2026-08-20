import { Inject, Injectable } from '@nestjs/common';

import type { OutboxRepository } from '@/application/ports/outbox-repository.port';
import { OUTBOX_REPOSITORY } from '@/application/ports/outbox-repository.port';
import { OrderRepository } from '@/application/ports/order.repository';
import { OrderNotFoundError } from '@/domain/errors/order.erros';
import { OrderEntity } from '@/domain/entities/order.entity';
import { OrderMapper } from '../persistence/order.mapper';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrderPrismaRepository implements OrderRepository {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject(OUTBOX_REPOSITORY) private readonly outbox: OutboxRepository,
  ) {}
  async findById(id: string): Promise<OrderEntity | null> {
    const order = await this.prismaService.order.findUnique({
      where: { id },
      include: {
        items: {
          select: {
            id: true,
            name: true,
            quantity: true,
            price: true,
            createdAt: true,
            updatedAt: true,
            itemId: true,
            orderId: true,
          },
        },
      },
    });

    if (!order) {
      return null;
    }

    return OrderMapper.toDomain(order);
  }

  async findAll(params: {
    ownerId: string;
    limit: number;
    offset: number;
  }): Promise<{ data: OrderEntity[]; total: number }> {
    const { ownerId, limit, offset } = params;

    const [orders, total] = await Promise.all([
      this.prismaService.order.findMany({
        where: { establishmentId: ownerId },
        take: limit,
        skip: offset,
        include: {
          items: {
            select: {
              id: true,
              name: true,
              quantity: true,
              price: true,
              createdAt: true,
              updatedAt: true,
              itemId: true,
              orderId: true,
            },
          },
        },
      }),
      this.prismaService.order.count({
        where: { establishmentId: ownerId },
      }),
    ]);

    return {
      data: OrderMapper.toDomainList(orders),
      total,
    };
  }

  async save(order: OrderEntity): Promise<void> {
    const { order: persistedOrder, items } = OrderMapper.toPersistence(order);
    const domainEvents = order.pullDomainEvents();

    await this.prismaService.$transaction(async (tx) => {
      await tx.order.create({ data: persistedOrder });

      if (items.length > 0) {
        await tx.orderItem.createMany({ data: items });
      }

      for (const event of domainEvents) {
        await this.outbox.add(tx, {
          eventId: crypto.randomUUID(),
          type: event.type,
          payload: event.payload,
          occurredAt: event.occurredAt,
        });
      }
    });
  }

  async update(order: OrderEntity): Promise<void> {
    const { order: persistedOrder, items } = OrderMapper.toPersistence(order);

    await this.prismaService.$transaction(async (tx) => {
      const existing = await tx.order.findUnique({
        where: { id: persistedOrder.id },
        select: { id: true },
      });

      if (!existing) throw new OrderNotFoundError();

      await tx.order.update({
        where: { id: persistedOrder.id },
        data: persistedOrder,
      });

      for (const item of items) {
        await tx.orderItem.upsert({
          where: { id: item.id },
          create: item,
          update: item,
        });
      }
    });
  }
}
