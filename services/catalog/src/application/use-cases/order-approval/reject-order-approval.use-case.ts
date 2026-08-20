import { Inject, Injectable } from '@nestjs/common';

import type { OrderApprovalRepository } from '@/application/ports/order-approval-repository.port';
import type { EstablishmentRepository } from '@/application/ports/establishment-repository.port';
import { ORDER_APPROVAL_REPOSITORY } from '@/application/ports/order-approval-repository.port';
import { ESTABLISHMENT_REPOSITORY } from '@/application/ports/establishment-repository.port';
import { EstablishmentNotFoundError } from '@/domain/errors/establishment.error';
import {
  OrderApprovalNotFoundError,
  OrderApprovalNotOwnedError,
} from '@/domain/errors/order-approval.errors';

type RejectOrderApprovalInput = {
  orderId: string;
  requesterId: string;
};

@Injectable()
export class RejectOrderApprovalUseCase {
  constructor(
    @Inject(ORDER_APPROVAL_REPOSITORY)
    private readonly orderApprovals: OrderApprovalRepository,
    @Inject(ESTABLISHMENT_REPOSITORY)
    private readonly establishments: EstablishmentRepository,
  ) {}

  async execute(input: RejectOrderApprovalInput): Promise<void> {
    const approval = await this.orderApprovals.findByOrderId(input.orderId);

    if (!approval) throw new OrderApprovalNotFoundError(input.orderId);

    const establishment = await this.establishments.findById(approval.establishmentId);

    if (!establishment) throw new EstablishmentNotFoundError(approval.establishmentId);
    if (establishment.ownerId !== input.requesterId) {
      throw new OrderApprovalNotOwnedError(input.orderId);
    }

    approval.reject(input.requesterId);

    await this.orderApprovals.update(approval);
  }
}
