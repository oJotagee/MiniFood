import { beforeEach, describe, expect, it, mock } from 'bun:test';

import type { AuthenticatedRequest } from '@/infrastructure/auth/authenticated-request';
import { OrderItemController } from '@/presentation/controllers/order-item.controller';

function requestFor(userId: string): AuthenticatedRequest {
  return { user: { userId, username: 'joao', email: 'joao@example.com', roles: [] } };
}

const orderItemFixture = {
  id: 'item-1',
  name: 'Hamburger',
  quantity: '2',
  price: '15.00',
  itemId: 'catalog-item-1',
  orderId: 'order-1',
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};

describe('OrderItemController', () => {
  let findAllOrderItemsUseCase: { execute: ReturnType<typeof mock> };
  let findOrderItemByIdUseCase: { execute: ReturnType<typeof mock> };
  let updateOrderItemUseCase: { execute: ReturnType<typeof mock> };
  let controller: OrderItemController;

  beforeEach(() => {
    findAllOrderItemsUseCase = { execute: mock() };
    findOrderItemByIdUseCase = { execute: mock() };
    updateOrderItemUseCase = { execute: mock() };

    controller = new OrderItemController(
      findAllOrderItemsUseCase as never,
      findOrderItemByIdUseCase as never,
      updateOrderItemUseCase as never,
    );
  });

  it('findAllOrderItems passes the orderId from the route and the query filter', async () => {
    findAllOrderItemsUseCase.execute.mockResolvedValue({
      list: [orderItemFixture],
      pagination: { page: 1, perPage: 10, total: 1, totalPages: 1 },
    });

    const result = await controller.findAllOrderItems('order-1', { limit: 10, offset: 0 } as never);

    expect(findAllOrderItemsUseCase.execute).toHaveBeenCalledWith({
      orderId: 'order-1',
      limit: 10,
      offset: 0,
    });
    expect(result.list[0].id).toBe('item-1');
  });

  it('findOrderItemById passes only the item id', async () => {
    findOrderItemByIdUseCase.execute.mockResolvedValue(orderItemFixture);

    const result = await controller.findOrderItemById('item-1');

    expect(findOrderItemByIdUseCase.execute).toHaveBeenCalledWith({ id: 'item-1' });
    expect(result.id).toBe('item-1');
  });

  it('updateOrderItem passes orderId, itemId, requesterId from the token, and the body', async () => {
    updateOrderItemUseCase.execute.mockResolvedValue(orderItemFixture);

    const body = { name: 'Veggie hamburger' };

    const result = await controller.updateOrderItem(
      'order-1',
      'item-1',
      body as never,
      requestFor('customer-1'),
    );

    expect(updateOrderItemUseCase.execute).toHaveBeenCalledWith({
      orderId: 'order-1',
      itemId: 'item-1',
      requesterId: 'customer-1',
      ...body,
    });
    expect(result.id).toBe('item-1');
  });
});
