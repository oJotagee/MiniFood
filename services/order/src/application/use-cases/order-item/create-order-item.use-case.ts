import { Inject, Injectable } from '@nestjs/common';

import { ORDER_ITEM_CREATION_TOKEN, OrderItemEntity } from '@/domain/entities/order-item.entity';
import type { OrderItemRepository } from '@/application/ports/order-item-repository';
import { ORDER_ITEM_REPOSITORY } from '@/application/ports/order-item-repository';
import { Quantity } from '@/domain/value-objects/quantity.vo';
import { Money } from '@/domain/value-objects/money.vo';

type CreateOrderItemInput = {
  name: string;
  quantity: Quantity;
  price: Money;
  itemId: string;
  orderId: string;
};

type CreateOrderItemOutput = {
  id: string;
  name: string;
  quantity: Quantity;
  price: Money;
  itemId: string;
  orderId: string;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class CreateOrderItemUseCase {
  constructor(
    @Inject(ORDER_ITEM_REPOSITORY)
    private readonly orderItems: OrderItemRepository,
  ) {}

  async execute(input: CreateOrderItemInput): Promise<CreateOrderItemOutput> {
    const orderItem = OrderItemEntity.create(
      {
        id: crypto.randomUUID(),
        name: input.name,
        quantity: input.quantity,
        price: input.price,
        itemId: input.itemId,
        orderId: input.orderId,
      },
      ORDER_ITEM_CREATION_TOKEN,
    );

    await this.orderItems.save(orderItem);

    return {
      id: orderItem.id,
      name: orderItem.name,
      quantity: orderItem.quantity,
      price: orderItem.price,
      itemId: orderItem.itemId,
      orderId: orderItem.orderId,
      createdAt: orderItem.createdAt,
      updatedAt: orderItem.updatedAt,
    };
  }
}
