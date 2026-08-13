import { Inject, Injectable } from '@nestjs/common';

import type { OrderItemRepository } from '@/application/ports/order-item-repository';
import { ORDER_ITEM_REPOSITORY } from '@/application/ports/order-item-repository';
import { OrderItemNotFound } from '@/domain/errors/order-item.errors';

type FindOrderItemByIdInput = {
  id: string;
};

type FindOrderItemByIdOutput = {
  id: string;
  name: string;
  quantity: string;
  price: string;
  itemId: string;
  orderId: string;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class FindOrderItemByIdUseCase {
  constructor(
    @Inject(ORDER_ITEM_REPOSITORY)
    private readonly orderItems: OrderItemRepository,
  ) {}

  async execute(input: FindOrderItemByIdInput): Promise<FindOrderItemByIdOutput> {
    const orderItem = await this.orderItems.findById(input.id);

    if (!orderItem) throw new OrderItemNotFound(`Order item with ID ${input.id} not found.`);

    return {
      id: orderItem.id,
      name: orderItem.name,
      quantity: orderItem.quantityString,
      price: orderItem.price.toDecimal(),
      itemId: orderItem.itemId,
      orderId: orderItem.orderId,
      createdAt: orderItem.createdAt,
      updatedAt: orderItem.updatedAt,
    };
  }
}
