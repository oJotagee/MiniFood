import { beforeEach, describe, expect, it, mock } from 'bun:test';

import type { AuthenticatedRequest } from '@/infrastructure/auth/authenticated-request';
import { OrderController } from '@/presentation/controllers/order.controller';

function requestFor(userId: string): AuthenticatedRequest {
  return { user: { userId, username: 'joao', email: 'joao@example.com', roles: [] } };
}

const orderFixture = {
  id: 'order-1',
  status: 'CREATED',
  customerId: 'customer-1',
  establishmentId: 'establishment-1',
  items: [
    {
      id: 'item-1',
      name: 'Hamburger',
      quantity: '2',
      price: '15.00',
      itemId: 'catalog-item-1',
      orderId: 'order-1',
    },
  ],
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};

describe('OrderController', () => {
  let findAllOrdersUseCase: { execute: ReturnType<typeof mock> };
  let findOrderByIdUseCase: { execute: ReturnType<typeof mock> };
  let createOrderUseCase: { execute: ReturnType<typeof mock> };
  let controller: OrderController;

  beforeEach(() => {
    findAllOrdersUseCase = { execute: mock() };
    findOrderByIdUseCase = { execute: mock() };
    createOrderUseCase = { execute: mock() };

    controller = new OrderController(
      findAllOrdersUseCase as never,
      findOrderByIdUseCase as never,
      createOrderUseCase as never,
    );
  });

  it('findAllOrders passes the query filter and the requester id as ownerId', async () => {
    findAllOrdersUseCase.execute.mockResolvedValue({
      list: [orderFixture],
      pagination: { page: 1, perPage: 10, total: 1, totalPages: 1 },
    });

    const result = await controller.findAllOrders(
      { limit: 10, offset: 0 } as never,
      requestFor('customer-1'),
    );

    expect(findAllOrdersUseCase.execute).toHaveBeenCalledWith({
      limit: 10,
      offset: 0,
      ownerId: 'customer-1',
    });
    expect(result.list[0].id).toBe('order-1');
  });

  it('findOrderById passes the id and the requester id from the token', async () => {
    findOrderByIdUseCase.execute.mockResolvedValue(orderFixture);

    const result = await controller.findOrderById('order-1', requestFor('customer-1'));

    expect(findOrderByIdUseCase.execute).toHaveBeenCalledWith({
      id: 'order-1',
      requesterId: 'customer-1',
    });
    expect(result.id).toBe('order-1');
  });

  it('createOrder uses the requester id from the token as customerId, never from the body', async () => {
    createOrderUseCase.execute.mockResolvedValue(orderFixture);

    const body = {
      establishmentId: 'establishment-1',
      items: [{ name: 'Hamburger', quantity: 2, priceCents: 1500n, itemId: 'catalog-item-1' }],
    };

    const result = await controller.createOrder(body as never, requestFor('customer-1'));

    expect(createOrderUseCase.execute).toHaveBeenCalledWith({
      ...body,
      customerId: 'customer-1',
    });
    expect(result.id).toBe('order-1');
  });

  it('createOrder ignores any customerId sent in the body', async () => {
    createOrderUseCase.execute.mockResolvedValue(orderFixture);

    const body = {
      establishmentId: 'establishment-1',
      customerId: 'spoofed-customer',
      items: [{ name: 'Hamburger', quantity: 2, priceCents: 1500n, itemId: 'catalog-item-1' }],
    };

    await controller.createOrder(body as never, requestFor('customer-1'));

    const call = createOrderUseCase.execute.mock.calls[0][0];
    expect(call.customerId).toBe('customer-1');
  });
});
