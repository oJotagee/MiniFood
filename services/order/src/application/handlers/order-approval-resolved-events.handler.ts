import { Injectable } from '@nestjs/common';

import { ResolveOrderApprovalUseCase } from '@/application/use-cases/order/resolve-order-approval.use-case';
import type {
  OrderApprovedEvent,
  OrderRejectedEvent,
} from '@/domain/events/order-approval-resolved.event';

@Injectable()
export class OrderApprovalResolvedEventsHandler {
  constructor(private readonly resolveOrderApproval: ResolveOrderApprovalUseCase) {}

  async handle(event: OrderApprovedEvent | OrderRejectedEvent): Promise<void> {
    switch (event.type) {
      case 'order.approved':
        return this.resolveOrderApproval.execute({
          outcome: 'approved',
          orderId: event.payload.orderId,
        });
      case 'order.rejected':
        return this.resolveOrderApproval.execute({
          outcome: 'rejected',
          orderId: event.payload.orderId,
          reason: event.payload.reason,
        });
    }
  }
}
