import { Inject, Injectable } from '@nestjs/common';

import type { OrderApprovalRepository } from '@/application/ports/order-approval-repository.port';
import type { EstablishmentRepository } from '@/application/ports/establishment-repository.port';
import { ORDER_APPROVAL_REPOSITORY } from '@/application/ports/order-approval-repository.port';
import { ESTABLISHMENT_REPOSITORY } from '@/application/ports/establishment-repository.port';
import { EstablishmentNotFoundError } from '@/domain/errors/establishment.error';
import {
  OrderApprovalStatus,
  type OrderApprovalItem,
} from '@/domain/entities/order-approval.entity';
import {
  OrderApprovalNotFoundError,
  OrderApprovalNotOwnedError,
} from '@/domain/errors/order-approval.errors';

type FindOrderApprovalByIdInput = {
  orderId: string;
  requesterId: string;
};

type FindOrderApprovalByIdOutput = {
  orderId: string;
  establishmentId: string;
  status: OrderApprovalStatus;
  items: OrderApprovalItem[];
  decidedBy: string | undefined;
  decidedAt: Date | undefined;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class FindOrderApprovalByIdUseCase {
  constructor(
    @Inject(ORDER_APPROVAL_REPOSITORY)
    private readonly orderApprovals: OrderApprovalRepository,
    @Inject(ESTABLISHMENT_REPOSITORY)
    private readonly establishments: EstablishmentRepository,
  ) {}

  async execute(input: FindOrderApprovalByIdInput): Promise<FindOrderApprovalByIdOutput> {
    const approval = await this.orderApprovals.findByOrderId(input.orderId);

    if (!approval) throw new OrderApprovalNotFoundError(input.orderId);

    const establishment = await this.establishments.findById(approval.establishmentId);

    if (!establishment) throw new EstablishmentNotFoundError(approval.establishmentId);
    if (establishment.ownerId !== input.requesterId) {
      throw new OrderApprovalNotOwnedError(input.orderId);
    }

    return {
      orderId: approval.orderId,
      establishmentId: approval.establishmentId,
      status: approval.status,
      items: [...approval.items],
      decidedBy: approval.decidedBy,
      decidedAt: approval.decidedAt,
      createdAt: approval.createdAt,
      updatedAt: approval.updatedAt,
    };
  }
}
