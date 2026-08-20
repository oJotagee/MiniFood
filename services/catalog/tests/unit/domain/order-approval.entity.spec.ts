import { describe, expect, it } from 'bun:test';

import { OrderApprovalAlreadyDecidedError } from '@/domain/errors/order-approval.errors';
import { OrderApprovalEntity, OrderApprovalStatus } from '@/domain/entities/order-approval.entity';

function pendingApproval(): OrderApprovalEntity {
  return OrderApprovalEntity.create({
    orderId: 'order-1',
    operationId: 'order:order-1:approval',
    establishmentId: 'establishment-1',
    items: [{ itemId: 'item-1', quantity: 2, priceCents: '1500' }],
  });
}

describe('OrderApprovalEntity', () => {
  it('starts as PENDING when created', () => {
    const approval = pendingApproval();

    expect(approval.status).toBe(OrderApprovalStatus.PENDING);
    expect(approval.decidedBy).toBeUndefined();
    expect(approval.decidedAt).toBeUndefined();
  });

  it('approve() moves to APPROVED and records who decided', () => {
    const approval = pendingApproval();

    approval.approve('owner-1');

    expect(approval.status).toBe(OrderApprovalStatus.APPROVED);
    expect(approval.decidedBy).toBe('owner-1');
    expect(approval.decidedAt).toBeInstanceOf(Date);
  });

  it('reject() moves to REJECTED and records who decided', () => {
    const approval = pendingApproval();

    approval.reject('owner-1');

    expect(approval.status).toBe(OrderApprovalStatus.REJECTED);
    expect(approval.decidedBy).toBe('owner-1');
  });

  it('throws when approving an already-decided approval (no silent override)', () => {
    const approval = pendingApproval();
    approval.approve('owner-1');

    expect(() => approval.approve('owner-1')).toThrow(OrderApprovalAlreadyDecidedError);
  });

  it('throws when rejecting an already-approved approval', () => {
    const approval = pendingApproval();
    approval.approve('owner-1');

    expect(() => approval.reject('owner-1')).toThrow(OrderApprovalAlreadyDecidedError);
  });
});
