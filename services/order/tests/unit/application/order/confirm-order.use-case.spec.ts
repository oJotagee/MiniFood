import { describe, expect, it, mock } from 'bun:test';

import { ConfirmOrderUseCase } from '@/application/use-cases/order/confirm-order.use-case';
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

describe('ConfirmOrderUseCase', () => {
  it('confirms an order owned by the requesting establishment', async () => {
    const order = buildOrder();
    const orders = makeRepository(order);
    const useCase = new ConfirmOrderUseCase(orders);

    const output = await useCase.execute({ id: 'order-1', requesterId: 'establishment-1' });

    expect(output.status).toBe('CONFIRMED');
    expect(orders.update).toHaveBeenCalledWith(order);
  });

  it('throws when the order does not exist', async () => {
    const orders = makeRepository(null);
    const useCase = new ConfirmOrderUseCase(orders);

    await expect(
      useCase.execute({ id: 'missing', requesterId: 'establishment-1' }),
    ).rejects.toThrow(OrderNotFoundError);
  });

  it('throws when the requester is not the owning establishment', async () => {
    const orders = makeRepository(buildOrder());
    const useCase = new ConfirmOrderUseCase(orders);

    await expect(
      useCase.execute({ id: 'order-1', requesterId: 'another-establishment' }),
    ).rejects.toThrow(OrderNotOwnedError);

    expect(orders.update).not.toHaveBeenCalled();
  });

  it('propagates invalid transitions without persisting', async () => {
    const order = buildOrder();
    order.confirm();
    const orders = makeRepository(order);
    const useCase = new ConfirmOrderUseCase(orders);

    await expect(
      useCase.execute({ id: 'order-1', requesterId: 'establishment-1' }),
    ).rejects.toThrow();

    expect(orders.update).not.toHaveBeenCalled();
  });
});
