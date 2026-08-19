import { Injectable } from '@nestjs/common';

import { OrderRepository } from '@/application/ports/order.repository';
import { OrderEntity } from '@/domain/entities/order.entity';
import { OrderMapper } from '../persistence/order.mapper';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrderPrismaRepository implements OrderRepository {
  constructor(private readonly prismaService: PrismaService) { }
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

    await this.prismaService.$transaction(async (tx) => {
      await tx.order.create({ data: persistedOrder });

      if (items.length > 0) {
        await tx.orderItem.createMany({ data: items });
      }
    });
  }

  async update(order: OrderEntity): Promise<void> {
    const { order: persistedOrder, items } = OrderMapper.toPersistence(order);

    const existing = await this.prismaService.order.findUnique({
      where: { id: persistedOrder.id },
      select: { id: true },
    });

    if (!existing) throw new Error(`Order with id ${persistedOrder.id} not found`);

    await this.prismaService.$transaction(async (tx) => {
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
