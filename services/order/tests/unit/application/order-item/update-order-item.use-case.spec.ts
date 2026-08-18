import { describe, expect, it, mock } from 'bun:test';

import { UpdateOrderItemUseCase } from '@/application/use-cases/order-item/update-order-item.use-case';
import { OrderNotFoundError, OrderNotOwnedError } from '@/domain/errors/order.erros';
import { OrderItemDoesNotBelongToOrderError } from '@/domain/errors/order-item.errors';
import type { OrderRepository } from '@/application/ports/order.repository';
import type { OrderEntity } from '@/domain/entities/order.entity';
import { buildOrder } from '../order/order.fixtures';

function makeRepository(order: OrderEntity | null): OrderRepository {
  return {
    findById: mock(async () => order),
    findAll: mock(async () => ({ data: [], total: 0 })),
    save: mock(async () => undefined),
    update: mock(async () => undefined),
  };
}

describe('UpdateOrderItemUseCase', () => {
  it('updates an item belonging to the requesting customer order', async () => {
    const order = buildOrder();
    const orders = makeRepository(order);
    const useCase = new UpdateOrderItemUseCase(orders);

    const output = await useCase.execute({
      orderId: 'order-1',
      itemId: 'item-1',
      requesterId: 'customer-1',
      name: 'Veggie hamburger',
      quantity: 3,
      priceCents: '2000',
    });

    expect(orders.update).toHaveBeenCalledWith(order);
    expect(output).toMatchObject({
      id: 'item-1',
      name: 'Veggie hamburger',
      quantity: '3',
      price: '20.00',
    });
  });

  it('throws when the order does not exist', async () => {
    const orders = makeRepository(null);
    const useCase = new UpdateOrderItemUseCase(orders);

    await expect(
      useCase.execute({ orderId: 'missing', itemId: 'item-1', requesterId: 'customer-1' }),
    ).rejects.toThrow(OrderNotFoundError);
  });

  it('throws when the requester is not the order owner', async () => {
    const orders = makeRepository(buildOrder());
    const useCase = new UpdateOrderItemUseCase(orders);

    await expect(
      useCase.execute({ orderId: 'order-1', itemId: 'item-1', requesterId: 'someone-else' }),
    ).rejects.toThrow(OrderNotOwnedError);

    expect(orders.update).not.toHaveBeenCalled();
  });

  it('throws when the item does not belong to the order', async () => {
    const orders = makeRepository(buildOrder());
    const useCase = new UpdateOrderItemUseCase(orders);

    await expect(
      useCase.execute({ orderId: 'order-1', itemId: 'unknown-item', requesterId: 'customer-1' }),
    ).rejects.toThrow(OrderItemDoesNotBelongToOrderError);
  });
});
