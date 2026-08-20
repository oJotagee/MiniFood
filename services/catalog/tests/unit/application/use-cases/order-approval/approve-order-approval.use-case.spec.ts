import { beforeEach, describe, expect, it } from 'bun:test';

import { ApproveOrderApprovalUseCase } from '@/application/use-cases/order-approval/approve-order-approval.use-case';
import { CreateEstablishmentUseCase } from '@/application/use-cases/establishment/create-establishment.use-case';
import { InMemoryOrderApprovalRepository } from '@tests/unit/support/in-memory-order-approval.repository';
import { InMemoryEstablishmentRepository } from '@tests/unit/support/in-memory-establishment.repository';
import { OrderApprovalEntity, OrderApprovalStatus } from '@/domain/entities/order-approval.entity';
import {
  OrderApprovalAlreadyDecidedError,
  OrderApprovalNotFoundError,
  OrderApprovalNotOwnedError,
} from '@/domain/errors/order-approval.errors';

const address = {
  street: 'Main St',
  number: '100',
  neighborhood: 'Center',
  city: 'Sao Paulo',
  state: 'SP',
  zipCode: '01000-000',
};

describe('ApproveOrderApprovalUseCase', () => {
  let establishments: InMemoryEstablishmentRepository;
  let orderApprovals: InMemoryOrderApprovalRepository;
  let useCase: ApproveOrderApprovalUseCase;

  beforeEach(() => {
    establishments = new InMemoryEstablishmentRepository();
    orderApprovals = new InMemoryOrderApprovalRepository();
    useCase = new ApproveOrderApprovalUseCase(orderApprovals, establishments);
  });

  async function pendingApproval(ownerId = 'owner-1') {
    const establishment = await new CreateEstablishmentUseCase(establishments).execute({
      name: 'Mini Food',
      ownerId,
      address,
    });

    const approval = OrderApprovalEntity.create({
      orderId: 'order-1',
      operationId: 'order:order-1:approval',
      establishmentId: establishment.id,
      items: [{ itemId: 'item-1', quantity: 1, priceCents: '1000' }],
    });
    await orderApprovals.save(approval);

    return establishment.id;
  }

  it('approves a pending order approval when requested by the establishment owner', async () => {
    await pendingApproval('owner-1');

    await useCase.execute({ orderId: 'order-1', requesterId: 'owner-1' });

    const approval = await orderApprovals.findByOrderId('order-1');
    expect(approval?.status).toBe(OrderApprovalStatus.APPROVED);
    expect(approval?.decidedBy).toBe('owner-1');
  });

  it('throws OrderApprovalNotFoundError when the approval does not exist', async () => {
    await expect(
      useCase.execute({ orderId: 'missing-order', requesterId: 'owner-1' }),
    ).rejects.toThrow(OrderApprovalNotFoundError);
  });

  it('throws OrderApprovalNotOwnedError when the requester does not own the establishment', async () => {
    await pendingApproval('owner-1');

    await expect(
      useCase.execute({ orderId: 'order-1', requesterId: 'someone-else' }),
    ).rejects.toThrow(OrderApprovalNotOwnedError);
  });

  it('throws OrderApprovalAlreadyDecidedError on a second approve call', async () => {
    await pendingApproval('owner-1');
    await useCase.execute({ orderId: 'order-1', requesterId: 'owner-1' });

    await expect(useCase.execute({ orderId: 'order-1', requesterId: 'owner-1' })).rejects.toThrow(
      OrderApprovalAlreadyDecidedError,
    );
  });
});
