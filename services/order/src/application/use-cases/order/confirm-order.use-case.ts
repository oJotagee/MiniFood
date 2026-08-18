import { Inject, Injectable } from '@nestjs/common';

import { OrderNotFoundError, OrderNotOwnedError } from '@/domain/errors/order.erros';
import type { OrderRepository } from '@/application/ports/order.repository';
import { ORDER_REPOSITORY } from '@/application/ports/order.repository';

type ConfirmOrderInput = {
  id: string;
  requesterId: string;
};

type ConfirmOrderOutput = {
  id: string;
  status: string;
  customerId: string;
  establishmentId: string;
  updatedAt: Date;
};

@Injectable()
export class ConfirmOrderUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orders: OrderRepository,
  ) {}

  async execute(input: ConfirmOrderInput): Promise<ConfirmOrderOutput> {
    const order = await this.orders.findById(input.id);

    if (!order) throw new OrderNotFoundError();

    if (order.establishmentIdString !== input.requesterId) throw new OrderNotOwnedError(input.id);

    order.confirm();

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
