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
}
