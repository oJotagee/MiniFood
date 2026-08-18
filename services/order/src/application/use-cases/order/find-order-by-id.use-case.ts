import { Inject, Injectable } from '@nestjs/common';

import { OrderNotFoundError, OrderNotOwnedError } from '@/domain/errors/order.erros';
import type { OrderRepository } from '@/application/ports/order.repository';
import { ORDER_REPOSITORY } from '@/application/ports/order.repository';

type FindOrderByIdInput = {
  id: string;
  requesterId: string;
};

type FindOrderByIdItemOutput = {
  id: string;
  name: string;
  quantity: string;
  price: string;
  itemId: string;
  orderId: string;
};

type FindOrderByIdOutput = {
  id: string;
  status: string;
  customerId: string;
  establishmentId: string;
  items: FindOrderByIdItemOutput[];
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class FindOrderByIdUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orders: OrderRepository,
  ) {}

  async execute(input: FindOrderByIdInput): Promise<FindOrderByIdOutput> {
    const order = await this.orders.findById(input.id);

    if (!order) throw new OrderNotFoundError();

    if (order.customerIdString !== input.requesterId) throw new OrderNotOwnedError(input.id);

    return {
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
    };
  }
}
