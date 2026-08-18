import { Inject, Injectable } from '@nestjs/common';

import { OrderNotFoundError, OrderNotOwnedError } from '@/domain/errors/order.erros';
import type { OrderRepository } from '@/application/ports/order.repository';
import { ORDER_REPOSITORY } from '@/application/ports/order.repository';
import { OrderItemNotFound } from '@/domain/errors/order-item.errors';
import { Quantity } from '@/domain/value-objects/quantity.vo';
import { Money } from '@/domain/value-objects/money.vo';

type UpdateOrderItemInput = {
  orderId: string;
  itemId: string;
  requesterId: string;
  name?: string;
  quantity?: number | string;
  priceCents?: bigint | string;
};

type UpdateOrderItemOutput = {
  id: string;
  name: string;
  quantity: string;
  price: string;
  itemId: string;
  orderId: string;
  updatedAt: Date;
};

@Injectable()
export class UpdateOrderItemUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orders: OrderRepository,
  ) {}

  async execute(input: UpdateOrderItemInput): Promise<UpdateOrderItemOutput> {
    const order = await this.orders.findById(input.orderId);

    if (!order) throw new OrderNotFoundError();

    if (order.customerIdString !== input.requesterId) throw new OrderNotOwnedError(input.orderId);

    order.updateItem(input.itemId, {
      name: input.name,
      quantity: input.quantity !== undefined ? Quantity.from(input.quantity) : undefined,
      price: input.priceCents !== undefined ? Money.fromCents(input.priceCents) : undefined,
    });

    await this.orders.update(order);

    const updatedItem = order.items.find((item) => item.id === input.itemId);

    if (!updatedItem) throw new OrderItemNotFound(`Order item with ID ${input.itemId} not found.`);

    return {
      id: updatedItem.id,
      name: updatedItem.name,
      quantity: updatedItem.quantityString,
      price: updatedItem.price.toDecimal(),
      itemId: updatedItem.itemId,
      orderId: updatedItem.orderId,
      updatedAt: updatedItem.updatedAt,
    };
  }
}
