import { describe, expect, it, mock } from 'bun:test';

import { CreateOrderUseCase } from '@/application/use-cases/order/create-order.use-case';
import type { OrderRepository } from '@/application/ports/order.repository';
import { OrderEntity } from '@/domain/entities/order.entity';

function makeRepository(): OrderRepository {
  return {
    findById: mock(async () => null),
    findAll: mock(async () => ({ data: [], total: 0 })),
    save: mock(async () => undefined),
    update: mock(async () => undefined),
  };
}

function baseInput() {
  return {
    customerId: 'customer-1',
    establishmentId: 'establishment-1',
    items: [
      { name: 'Hamburger', quantity: 2, priceCents: '1500', itemId: 'catalog-item-1' },
      { name: 'Fries', quantity: '1', priceCents: 800n, itemId: 'catalog-item-2' },
    ],
  };
}

describe('CreateOrderUseCase', () => {
  it('creates an order with its items and persists it', async () => {
    const orders = makeRepository();
    const useCase = new CreateOrderUseCase(orders);

    const output = await useCase.execute(baseInput());

    expect(orders.save).toHaveBeenCalledTimes(1);
    expect((orders.save as ReturnType<typeof mock>).mock.calls[0][0]).toBeInstanceOf(OrderEntity);

    expect(output.status).toBe('CREATED');
    expect(output.customerId).toBe('customer-1');
    expect(output.establishmentId).toBe('establishment-1');
    expect(output.items).toHaveLength(2);
    expect(output.items[0]).toMatchObject({
      name: 'Hamburger',
      quantity: '2',
      price: '15.00',
      itemId: 'catalog-item-1',
    });
    expect(output.items[1]).toMatchObject({
      name: 'Fries',
      quantity: '1',
      price: '8.00',
      itemId: 'catalog-item-2',
    });
    expect(output.items[0].orderId).toBe(output.id);
    expect(output.items[1].orderId).toBe(output.id);
  });

  it('propagates domain validation errors without saving', async () => {
    const orders = makeRepository();
    const useCase = new CreateOrderUseCase(orders);

    await expect(useCase.execute({ ...baseInput(), items: [] })).rejects.toThrow();

    expect(orders.save).not.toHaveBeenCalled();
  });
});
