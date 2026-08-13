import { Inject, Injectable } from '@nestjs/common';

import type { OrderRepository } from '@/application/ports/order.repository';
import { ORDER_REPOSITORY } from '@/application/ports/order.repository';

type FindAllOrdersInput = {
  ownerId: string;
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
};

type OrderOutput = {
  id: string;
  status: string;
  customerId: string;
  establishmentId: string;
  items: OrderItemOutput[];
  createdAt: Date;
  updatedAt: Date;
};

type FindAllOrdersOutput = {
  list: OrderOutput[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
};

@Injectable()
export class FindAllOrdersUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orders: OrderRepository,
  ) {}

  async execute(input: FindAllOrdersInput): Promise<FindAllOrdersOutput> {
    const limit =
      Number.isInteger(input.limit) && input.limit! > 0 ? Math.min(input.limit!, 100) : 10;
    const offset = Number.isInteger(input.offset) && input.offset! > 0 ? input.offset! : 0;

    const { data, total } = await this.orders.findAll({
      ownerId: input.ownerId,
      limit,
      offset,
    });

    return {
      list: data.map((order) => ({
        id: order.id,
        status: order.status,
        customerId: order.customerIdString,
        establishmentId: order.establishmentIdString,
        items: order.items.map((item) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantityString,
          price: item.price.toDecimal(),
          itemId: item.itemId,
          orderId: item.orderId,
        })),
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
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
