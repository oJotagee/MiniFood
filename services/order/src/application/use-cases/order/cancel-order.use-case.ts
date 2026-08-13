import { Inject, Injectable } from '@nestjs/common';

import { OrderNotFoundError, OrderNotOwnedError } from '@/domain/errors/order.erros';
import type { OrderRepository } from '@/application/ports/order.repository';
import { ORDER_REPOSITORY } from '@/application/ports/order.repository';

type CancelOrderInput = {
  id: string;
  requesterId: string;
};

type CancelOrderOutput = {
  id: string;
  status: string;
  customerId: string;
  establishmentId: string;
  updatedAt: Date;
};

@Injectable()
export class CancelOrderUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orders: OrderRepository,
  ) { }

  async execute(input: CancelOrderInput): Promise<CancelOrderOutput> {
    const order = await this.orders.findById(input.id);

    if (!order) throw new OrderNotFoundError();

    if (order.customerIdString !== input.requesterId) throw new OrderNotOwnedError(input.id);

    order.cancel();

    await this.orders.update(order);

    return {
      id: order.id,
      status: order.status,
      customerId: order.customerIdString,
      establishmentId: order.establishmentIdString,
      updatedAt: order.updatedAt,
    };
  }
}
