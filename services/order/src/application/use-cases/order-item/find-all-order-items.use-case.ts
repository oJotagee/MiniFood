import { Inject, Injectable } from '@nestjs/common';

import type { OrderItemRepository } from '@/application/ports/order-item-repository';
import { ORDER_ITEM_REPOSITORY } from '@/application/ports/order-item-repository';

type FindAllOrderItemsInput = {
  orderId: string;
  limit?: number;
  offset?: number;
};

type OrderItemOutput = {
  id: string;
  name: string;
  quantity: string;
  price: string;
  itemId: string;
  orderId: string;
  createdAt: Date;
  updatedAt: Date;
};

type FindAllOrderItemsOutput = {
  list: OrderItemOutput[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
};

@Injectable()
export class FindAllOrderItemsUseCase {
  constructor(
    @Inject(ORDER_ITEM_REPOSITORY)
    private readonly orderItems: OrderItemRepository,
  ) {}

  async execute(input: FindAllOrderItemsInput): Promise<FindAllOrderItemsOutput> {
    const limit =
      Number.isInteger(input.limit) && input.limit! > 0 ? Math.min(input.limit!, 100) : 10;
    const offset = Number.isInteger(input.offset) && input.offset! > 0 ? input.offset! : 0;

    const { data, total } = await this.orderItems.findAll({
      orderId: input.orderId,
      limit,
      offset,
    });

    return {
      list: data.map((orderItem) => ({
        id: orderItem.id,
        name: orderItem.name,
        quantity: orderItem.quantityString,
        price: orderItem.price.toDecimal(),
        itemId: orderItem.itemId,
        orderId: orderItem.orderId,
        createdAt: orderItem.createdAt,
        updatedAt: orderItem.updatedAt,
      })),
      pagination: {
        page: Math.floor(offset / limit) + 1,
        perPage: limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
