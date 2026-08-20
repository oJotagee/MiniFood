import { Inject, Injectable } from '@nestjs/common';

import { ApproveOrRejectOrderUseCase } from '@/application/use-cases/order-approval/approve-or-reject-order.use-case';
import type { OutboxRepository } from '@/application/ports/outbox-repository.port';
import { OUTBOX_REPOSITORY } from '@/application/ports/outbox-repository.port';
import {
  ProductBelongsToAnotherEstablishmentError,
  ProductNotAvailableError,
  ProductNotFoundError,
} from '@/domain/errors/product.errors';

export type OrderApprovalRequested = {
  type: 'order.approval.requested';
  payload: {
    operationId: string;
    orderId: string;
    establishmentId: string;
    items: Array<{ itemId: string; quantity: number; priceCents: string }>;
  };
};

@Injectable()
export class OrderApprovalEventsHandler {
  constructor(
    private readonly approveOrRejectOrder: ApproveOrRejectOrderUseCase,
    @Inject(OUTBOX_REPOSITORY) private readonly outbox: OutboxRepository,
  ) {}

  async handle(event: OrderApprovalRequested): Promise<void> {
    switch (event.type) {
      case 'order.approval.requested':
        return this.onApprovalRequested(event);
    }
  }

  private async onApprovalRequested(event: OrderApprovalRequested): Promise<void> {
    const { operationId, orderId, establishmentId, items } = event.payload;
    const occurredAt = new Date();

    try {
      await this.approveOrRejectOrder.execute({ operationId, orderId, establishmentId, items });
    } catch (error) {
      const reason =
        error instanceof ProductNotFoundError
          ? 'PRODUCT_NOT_FOUND'
          : error instanceof ProductNotAvailableError
            ? 'PRODUCT_NOT_AVAILABLE'
            : error instanceof ProductBelongsToAnotherEstablishmentError
              ? 'PRODUCT_FROM_ANOTHER_ESTABLISHMENT'
              : 'UNKNOWN';

      await this.outbox.runInTransaction(async (tx) => {
        await this.outbox.add(tx, {
          eventId: crypto.randomUUID(),
          type: 'order.rejected',
          payload: { operationId, orderId, reason },
          occurredAt,
        });
      });

      if (reason === 'UNKNOWN') {
        throw error;
      }
    }
  }
}
