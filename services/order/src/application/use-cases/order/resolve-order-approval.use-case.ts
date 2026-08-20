import { Inject, Injectable, Logger } from '@nestjs/common';

import type { OrderRepository } from '@/application/ports/order.repository';
import { ORDER_REPOSITORY } from '@/application/ports/order.repository';

type ResolveOrderApprovalInput =
  | { outcome: 'approved'; orderId: string }
  | { outcome: 'rejected'; orderId: string; reason: string };

@Injectable()
export class ResolveOrderApprovalUseCase {
  private readonly logger = new Logger(ResolveOrderApprovalUseCase.name);

  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orders: OrderRepository,
  ) {}

  async execute(input: ResolveOrderApprovalInput): Promise<void> {
    const order = await this.orders.findById(input.orderId);

    if (!order) {
      this.logger.warn(`Order ${input.orderId} not found while resolving approval`);
      return;
    }

    if (input.outcome === 'approved') {
      order.confirm();
    } else {
      order.cancel();
      this.logger.log(`Order ${input.orderId} rejected by catalog: ${input.reason}`);
    }

    await this.orders.update(order);
  }
}
