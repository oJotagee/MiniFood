import { describe, expect, it, mock } from 'bun:test';

import { FindAllOrdersUseCase } from '@/application/use-cases/order/find-all-orders.use-case';
import type { OrderRepository } from '@/application/ports/order.repository';
import { buildOrder } from './order.fixtures';

describe('FindAllOrdersUseCase', () => {
  it('applies default pagination and maps orders to output', async () => {
    const orders: OrderRepository = {
      findById: mock(async () => null),
      findAll: mock(async () => ({ data: [buildOrder()], total: 1 })),
      save: mock(async () => undefined),
      update: mock(async () => undefined),
    };
    const useCase = new FindAllOrdersUseCase(orders);

    const output = await useCase.execute({ ownerId: 'establishment-1' });

    expect(orders.findAll).toHaveBeenCalledWith({
      ownerId: 'establishment-1',
      limit: 10,
      offset: 0,
    });
    expect(output.list).toHaveLength(1);
    expect(output.list[0].items[0]).toMatchObject({ name: 'Hamburger', quantity: '2' });
    expect(output.pagination).toEqual({ page: 1, perPage: 10, total: 1, totalPages: 1 });
  });

  it('clamps the limit to 100 and honours a valid offset', async () => {
    const orders: OrderRepository = {
      findById: mock(async () => null),
      findAll: mock(async () => ({ data: [], total: 0 })),
      save: mock(async () => undefined),
      update: mock(async () => undefined),
    };
    const useCase = new FindAllOrdersUseCase(orders);

    await useCase.execute({ ownerId: 'establishment-1', limit: 500, offset: 20 });

    expect(orders.findAll).toHaveBeenCalledWith({
      ownerId: 'establishment-1',
      limit: 100,
      offset: 20,
    });
  });

  it('falls back to defaults for invalid pagination input', async () => {
    const orders: OrderRepository = {
      findById: mock(async () => null),
      findAll: mock(async () => ({ data: [], total: 0 })),
      save: mock(async () => undefined),
      update: mock(async () => undefined),
    };
    const useCase = new FindAllOrdersUseCase(orders);

    await useCase.execute({ ownerId: 'establishment-1', limit: -5, offset: -1 });

    expect(orders.findAll).toHaveBeenCalledWith({
      ownerId: 'establishment-1',
      limit: 10,
      offset: 0,
    });
  });
});
