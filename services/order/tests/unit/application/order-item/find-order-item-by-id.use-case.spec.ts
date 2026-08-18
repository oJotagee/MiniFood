import { describe, expect, it, mock } from 'bun:test';

import { FindOrderItemByIdUseCase } from '@/application/use-cases/order-item/find-order-item-by-id.use-case';
import type { OrderItemRepository } from '@/application/ports/order-item-repository';
import { OrderItemNotFound } from '@/domain/errors/order-item.errors';
import { buildOrderItem } from './order-item.fixtures';

describe('FindOrderItemByIdUseCase', () => {
  it('returns the order item mapped to its output shape', async () => {
    const orderItems: OrderItemRepository = {
      findById: mock(async () => buildOrderItem()),
      findAll: mock(async () => ({ data: [], total: 0 })),
      save: mock(async () => undefined),
      update: mock(async () => undefined),
    };
    const useCase = new FindOrderItemByIdUseCase(orderItems);

    const output = await useCase.execute({ id: 'item-1' });

    expect(output).toMatchObject({
      id: 'item-1',
      name: 'Hamburger',
      quantity: '2',
      price: '15.00',
      itemId: 'catalog-item-1',
      orderId: 'order-1',
    });
  });

  it('throws when the order item does not exist', async () => {
    const orderItems: OrderItemRepository = {
      findById: mock(async () => null),
      findAll: mock(async () => ({ data: [], total: 0 })),
      save: mock(async () => undefined),
      update: mock(async () => undefined),
    };
    const useCase = new FindOrderItemByIdUseCase(orderItems);

    await expect(useCase.execute({ id: 'missing' })).rejects.toThrow(OrderItemNotFound);
  });
});
