import { describe, expect, it, mock } from 'bun:test';

import { CancelOrderUseCase } from '@/application/use-cases/order/cancel-order.use-case';
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

describe('CancelOrderUseCase', () => {
  it('cancels an order owned by the requesting customer', async () => {
    const order = buildOrder();
    const orders = makeRepository(order);
    const useCase = new CancelOrderUseCase(orders);

    const output = await useCase.execute({ id: 'order-1', requesterId: 'customer-1' });

    expect(output.status).toBe('CANCELED');
    expect(orders.update).toHaveBeenCalledWith(order);
  });

  it('throws when the order does not exist', async () => {
    const orders = makeRepository(null);
    const useCase = new CancelOrderUseCase(orders);

    await expect(useCase.execute({ id: 'missing', requesterId: 'customer-1' })).rejects.toThrow(
      OrderNotFoundError,
    );
  });

  it('throws when the requester is not the order owner', async () => {
    const orders = makeRepository(buildOrder());
    const useCase = new CancelOrderUseCase(orders);

    await expect(useCase.execute({ id: 'order-1', requesterId: 'someone-else' })).rejects.toThrow(
      OrderNotOwnedError,
    );

    expect(orders.update).not.toHaveBeenCalled();
  });
});
