import { describe, expect, it, mock } from 'bun:test';

import { CreateOrderItemUseCase } from '@/application/use-cases/order-item/create-order-item.use-case';
import type { OrderItemRepository } from '@/application/ports/order-item-repository';
import { OrderItemEntity } from '@/domain/entities/order-item.entity';
import { Quantity } from '@/domain/value-objects/quantity.vo';
import { Money } from '@/domain/value-objects/money.vo';

function makeRepository(): OrderItemRepository {
  return {
    findById: mock(async () => null),
    findAll: mock(async () => ({ data: [], total: 0 })),
    save: mock(async () => undefined),
    update: mock(async () => undefined),
  };
}

describe('CreateOrderItemUseCase', () => {
  it('creates an order item and persists it', async () => {
    const orderItems = makeRepository();
    const useCase = new CreateOrderItemUseCase(orderItems);

    const output = await useCase.execute({
      name: 'Hamburger',
      quantity: Quantity.from(2),
      price: Money.fromCents(1500n),
      itemId: 'catalog-item-1',
      orderId: 'order-1',
    });

    expect(orderItems.save).toHaveBeenCalledTimes(1);
    expect((orderItems.save as ReturnType<typeof mock>).mock.calls[0][0]).toBeInstanceOf(
      OrderItemEntity,
    );

    expect(output.name).toBe('Hamburger');
    expect(output.quantity.toString()).toBe('2');
    expect(output.price.toDecimal()).toBe('15.00');
    expect(output.itemId).toBe('catalog-item-1');
    expect(output.orderId).toBe('order-1');
    expect(output.id).toBeTruthy();
  });

  it('propagates domain validation errors without saving', async () => {
    const orderItems = makeRepository();
    const useCase = new CreateOrderItemUseCase(orderItems);

    await expect(
      useCase.execute({
        name: '',
        quantity: Quantity.from(2),
        price: Money.fromCents(1500n),
        itemId: 'catalog-item-1',
        orderId: 'order-1',
      }),
    ).rejects.toThrow();

    expect(orderItems.save).not.toHaveBeenCalled();
  });
});
