import { OrderApprovalEntity, OrderApprovalStatus } from '@/domain/entities/order-approval.entity';
import type { OrderApprovalRepository } from '@/application/ports/order-approval-repository.port';

export class InMemoryOrderApprovalRepository implements OrderApprovalRepository {
  private readonly approvals = new Map<string, OrderApprovalEntity>();
  public updateCalls = 0;

  async findByOrderId(orderId: string): Promise<OrderApprovalEntity | null> {
    return this.approvals.get(orderId) ?? null;
  }

  async findAll(params: {
    establishmentIds: string[];
    status?: OrderApprovalStatus;
    limit: number;
    offset: number;
  }): Promise<{ data: OrderApprovalEntity[]; total: number }> {
    const all = [...this.approvals.values()].filter(
      (approval) =>
        params.establishmentIds.includes(approval.establishmentId) &&
        (!params.status || approval.status === params.status),
    );

    return {
      data: all.slice(params.offset, params.offset + params.limit),
      total: all.length,
    };
  }

  async save(approval: OrderApprovalEntity): Promise<void> {
    this.approvals.set(approval.orderId, approval);
  }

  async update(approval: OrderApprovalEntity): Promise<void> {
    this.updateCalls += 1;
    this.approvals.set(approval.orderId, approval);
  }
}
