import { Inject, Injectable } from '@nestjs/common';

import type { OrderApprovalRepository } from '@/application/ports/order-approval-repository.port';
import type { EstablishmentRepository } from '@/application/ports/establishment-repository.port';
import { ORDER_APPROVAL_REPOSITORY } from '@/application/ports/order-approval-repository.port';
import { ESTABLISHMENT_REPOSITORY } from '@/application/ports/establishment-repository.port';
import {
  OrderApprovalStatus,
  type OrderApprovalItem,
} from '@/domain/entities/order-approval.entity';

type FindAllOrderApprovalsInput = {
  requesterId: string;
  status?: OrderApprovalStatus;
  limit?: number;
  offset?: number;
};

type OrderApprovalOutput = {
  orderId: string;
  establishmentId: string;
  status: OrderApprovalStatus;
  items: OrderApprovalItem[];
  decidedBy: string | undefined;
  decidedAt: Date | undefined;
  createdAt: Date;
  updatedAt: Date;
};

type FindAllOrderApprovalsOutput = {
  list: OrderApprovalOutput[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
};

@Injectable()
export class FindAllOrderApprovalsUseCase {
  constructor(
    @Inject(ORDER_APPROVAL_REPOSITORY)
    private readonly orderApprovals: OrderApprovalRepository,
    @Inject(ESTABLISHMENT_REPOSITORY)
    private readonly establishments: EstablishmentRepository,
  ) {}

  async execute(input: FindAllOrderApprovalsInput): Promise<FindAllOrderApprovalsOutput> {
    const limit =
      Number.isInteger(input.limit) && input.limit! > 0 ? Math.min(input.limit!, 100) : 10;
    const offset = Number.isInteger(input.offset) && input.offset! > 0 ? input.offset! : 0;

    const establishmentIds = await this.establishments.findIdsByOwnerId(input.requesterId);

    const { data, total } = await this.orderApprovals.findAll({
      establishmentIds,
      status: input.status,
      limit,
      offset,
    });

    return {
      list: data.map((approval) => ({
        orderId: approval.orderId,
        establishmentId: approval.establishmentId,
        status: approval.status,
        items: [...approval.items],
        decidedBy: approval.decidedBy,
        decidedAt: approval.decidedAt,
        createdAt: approval.createdAt,
        updatedAt: approval.updatedAt,
      })),
      pagination: {
        page: Math.floor(offset / limit) + 1,
        perPage: limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
