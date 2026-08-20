import { OrderApprovalEntity, OrderApprovalStatus } from '@/domain/entities/order-approval.entity';

export const ORDER_APPROVAL_REPOSITORY = Symbol('ORDER_APPROVAL_REPOSITORY');

export interface OrderApprovalRepository {
  findByOrderId(orderId: string): Promise<OrderApprovalEntity | null>;
  findAll(params: {
    establishmentIds: string[];
    status?: OrderApprovalStatus;
    limit: number;
    offset: number;
  }): Promise<{ data: OrderApprovalEntity[]; total: number }>;
  save(approval: OrderApprovalEntity): Promise<void>;
  update(approval: OrderApprovalEntity): Promise<void>;
}
