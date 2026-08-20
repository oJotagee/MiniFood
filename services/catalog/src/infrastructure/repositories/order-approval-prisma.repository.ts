import type { Prisma } from '@generated/prisma/client';
import { Inject, Injectable } from '@nestjs/common';

import type { OrderApprovalRepository } from '@/application/ports/order-approval-repository.port';
import type { OutboxRepository } from '@/application/ports/outbox-repository.port';
import { OUTBOX_REPOSITORY } from '@/application/ports/outbox-repository.port';
import { PrismaService } from '../prisma/prisma.service';
import {
  OrderApprovalEntity,
  OrderApprovalStatus,
  type OrderApprovalItem,
} from '@/domain/entities/order-approval.entity';

@Injectable()
export class OrderApprovalPrismaRepository implements OrderApprovalRepository {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject(OUTBOX_REPOSITORY) private readonly outbox: OutboxRepository,
  ) {}

  async findByOrderId(orderId: string): Promise<OrderApprovalEntity | null> {
    const row = await this.prismaService.orderApproval.findUnique({ where: { orderId } });

    if (!row) return null;

    return OrderApprovalEntity.restore({
      orderId: row.orderId,
      operationId: row.operationId,
      establishmentId: row.establishmentId,
      status: row.status as OrderApprovalStatus,
      items: row.items as unknown as OrderApprovalItem[],
      decidedBy: row.decidedBy ?? undefined,
      decidedAt: row.decidedAt ?? undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  async findAll(params: {
    establishmentIds: string[];
    status?: OrderApprovalStatus;
    limit: number;
    offset: number;
  }): Promise<{ data: OrderApprovalEntity[]; total: number }> {
    if (params.establishmentIds.length === 0) {
      return { data: [], total: 0 };
    }

    const where = {
      establishmentId: { in: params.establishmentIds },
      ...(params.status ? { status: params.status } : {}),
    };

    const [rows, total] = await Promise.all([
      this.prismaService.orderApproval.findMany({
        where,
        take: params.limit,
        skip: params.offset,
        orderBy: { createdAt: 'desc' },
      }),
      this.prismaService.orderApproval.count({ where }),
    ]);

    return {
      data: rows.map((row) =>
        OrderApprovalEntity.restore({
          orderId: row.orderId,
          operationId: row.operationId,
          establishmentId: row.establishmentId,
          status: row.status as OrderApprovalStatus,
          items: row.items as unknown as OrderApprovalItem[],
          decidedBy: row.decidedBy ?? undefined,
          decidedAt: row.decidedAt ?? undefined,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
        }),
      ),
      total,
    };
  }

  async save(approval: OrderApprovalEntity): Promise<void> {
    await this.prismaService.orderApproval.create({
      data: {
        orderId: approval.orderId,
        operationId: approval.operationId,
        establishmentId: approval.establishmentId,
        status: approval.status,
        items: approval.items as unknown as Prisma.InputJsonValue,
      },
    });
  }

  async update(approval: OrderApprovalEntity): Promise<void> {
    await this.prismaService.$transaction(async (tx) => {
      await tx.orderApproval.update({
        where: { orderId: approval.orderId },
        data: {
          status: approval.status,
          decidedBy: approval.decidedBy,
          decidedAt: approval.decidedAt,
        },
      });

      const eventType =
        approval.status === OrderApprovalStatus.APPROVED ? 'order.approved' : 'order.rejected';

      const payload =
        approval.status === OrderApprovalStatus.APPROVED
          ? { operationId: approval.operationId, orderId: approval.orderId }
          : {
              operationId: approval.operationId,
              orderId: approval.orderId,
              reason: 'REJECTED_BY_ESTABLISHMENT',
            };

      await this.outbox.add(tx, {
        eventId: crypto.randomUUID(),
        type: eventType,
        payload,
        occurredAt: approval.decidedAt ?? new Date(),
      });
    });
  }
}
