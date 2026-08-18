import { describe, expect, it, mock } from 'bun:test';

import { FindOrderByIdUseCase } from '@/application/use-cases/order/find-order-by-id.use-case';
import { OrderNotFoundError, OrderNotOwnedError } from '@/domain/errors/order.erros';
import type { OrderRepository } from '@/application/ports/order.repository';
import type { OrderEntity } from '@/domain/entities/order.entity';
import { buildOrder } from './order.fixtures';

function makeRepository(order: OrderEntity | null): OrderRepository {
  return {
    findById: mock(async () => order),
    findAll: mock(async () => ({ data: [], total: 0 })),
    save: mock(async () => undefined),
    update: mock(async () => undefined),
  };
}

describe('FindOrderByIdUseCase', () => {
  it('returns the order owned by the requester', async () => {
    const orders = makeRepository(buildOrder());
    const useCase = new FindOrderByIdUseCase(orders);

    const output = await useCase.execute({ id: 'order-1', requesterId: 'customer-1' });

    expect(output.id).toBe('order-1');
    expect(output.customerId).toBe('customer-1');
    expect(output.establishmentId).toBe('establishment-1');
    expect(output.items).toHaveLength(1);
    expect(output.items[0]).toMatchObject({
      name: 'Hamburger',
      quantity: '2',
      price: '15.00',
    });
  });

  it('throws when the order does not exist', async () => {
    const orders = makeRepository(null);
    const useCase = new FindOrderByIdUseCase(orders);

    await expect(useCase.execute({ id: 'missing', requesterId: 'customer-1' })).rejects.toThrow(
      OrderNotFoundError,
    );
  });

  it('throws when the requester is not the order owner', async () => {
    const orders = makeRepository(buildOrder());
    const useCase = new FindOrderByIdUseCase(orders);

    await expect(useCase.execute({ id: 'order-1', requesterId: 'someone-else' })).rejects.toThrow(
      OrderNotOwnedError,
    );
  });
});
