import { describe, expect, it, mock } from 'bun:test';

import { FindAllOrderItemsUseCase } from '@/application/use-cases/order-item/find-all-order-items.use-case';
import type { OrderItemRepository } from '@/application/ports/order-item-repository';
import { buildOrderItem } from './order-item.fixtures';

describe('FindAllOrderItemsUseCase', () => {
  it('applies default pagination and maps items to output', async () => {
    const orderItems: OrderItemRepository = {
      findById: mock(async () => null),
      findAll: mock(async () => ({ data: [buildOrderItem()], total: 1 })),
      save: mock(async () => undefined),
      update: mock(async () => undefined),
    };
    const useCase = new FindAllOrderItemsUseCase(orderItems);

    const output = await useCase.execute({ orderId: 'order-1' });

    expect(orderItems.findAll).toHaveBeenCalledWith({ orderId: 'order-1', limit: 10, offset: 0 });
    expect(output.list).toHaveLength(1);
    expect(output.list[0]).toMatchObject({ name: 'Hamburger', quantity: '2', price: '15.00' });
    expect(output.pagination).toEqual({ page: 1, perPage: 10, total: 1, totalPages: 1 });
  });

  it('clamps the limit to 100 and honours a valid offset', async () => {
    const orderItems: OrderItemRepository = {
      findById: mock(async () => null),
      findAll: mock(async () => ({ data: [], total: 0 })),
      save: mock(async () => undefined),
      update: mock(async () => undefined),
    };
    const useCase = new FindAllOrderItemsUseCase(orderItems);

    await useCase.execute({ orderId: 'order-1', limit: 500, offset: 20 });

    expect(orderItems.findAll).toHaveBeenCalledWith({ orderId: 'order-1', limit: 100, offset: 20 });
  });

  it('falls back to defaults for invalid pagination input', async () => {
    const orderItems: OrderItemRepository = {
      findById: mock(async () => null),
      findAll: mock(async () => ({ data: [], total: 0 })),
      save: mock(async () => undefined),
      update: mock(async () => undefined),
    };
    const useCase = new FindAllOrderItemsUseCase(orderItems);

    await useCase.execute({ orderId: 'order-1', limit: -5, offset: -1 });

    expect(orderItems.findAll).toHaveBeenCalledWith({ orderId: 'order-1', limit: 10, offset: 0 });
  });
});
