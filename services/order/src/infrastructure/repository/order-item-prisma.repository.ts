import { Injectable } from '@nestjs/common';

import { OrderItemRepository } from '@/application/ports/order-item-repository';
import { OrderItemEntity } from '@/domain/entities/order-item.entity';
import { OrderItemMapper } from '../persistence/order-item.mapper';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrderItemPrismaRepository implements OrderItemRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findById(id: string): Promise<OrderItemEntity | null> {
    const orderItem = await this.prismaService.orderItem.findUnique({
      where: { id },
    });

    if (!orderItem) {
      return null;
    }

    return OrderItemMapper.toDomain(orderItem);
  }

  async findAll(params: {
    orderId: string;
    limit: number;
    offset: number;
  }): Promise<{ data: OrderItemEntity[]; total: number }> {
    const [orderItem, total] = await Promise.all([
      this.prismaService.orderItem.findMany({
        where: { orderId: params.orderId },
        take: params.limit,
        skip: params.offset,
      }),
      this.prismaService.orderItem.count({
        where: { orderId: params.orderId },
      }),
    ]);

    return {
      data: OrderItemMapper.toDomainList(orderItem),
      total,
    };
  }

  async save(orderItem: OrderItemEntity): Promise<void> {
    const persistence = OrderItemMapper.toPersistence(orderItem);

    await this.prismaService.orderItem.create({
      data: persistence,
    });
  }

  async update(orderItem: OrderItemEntity): Promise<void> {
    const persistence = OrderItemMapper.toPersistence(orderItem);

    const existing = await this.prismaService.orderItem.findUnique({
      where: { id: persistence.id },
      select: { id: true },
    });

    if (!existing) throw new Error(`OrderItem with id ${persistence.id} not found`);

    await this.prismaService.orderItem.update({
      where: { id: persistence.id },
      data: persistence,
    });
  }
}
