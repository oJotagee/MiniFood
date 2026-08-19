import { describe, expect, it } from 'bun:test';
import type { ArgumentsHost } from '@nestjs/common';

import { InvalidEstablishmentIdError } from '@/domain/errors/establishment-id.errors';
import { InvalidCustomerIdError } from '@/domain/errors/customer-id.errors';
import { InvalidQuantityError } from '@/domain/errors/quantity.errors';
import { InvalidMoneyError } from '@/domain/errors/money.errors';
import {
  InvalidOrderStatusError,
  OrderMustHaveItemsError,
  OrderNotFoundError,
  OrderNotOwnedError,
  OrderStatusEmptyError,
} from '@/domain/errors/order.erros';
import {
  ItemIdNotFound,
  OrderIdNotFound,
  OrderItemCannotBeCreatedDirectlyError,
  OrderItemDoesNotBelongToOrderError,
  OrderItemNameCannotBeEmpty,
  OrderItemNotFound,
} from '@/domain/errors/order-item.errors';
import { DomainExceptionFilter } from '@/presentation/filters/domain-exception.filter';

function buildHost(url = '/orders/123') {
  const json = (body: Record<string, unknown>) => {
    captured.body = body;
  };
  const status = (statusCode: number) => {
    captured.statusCode = statusCode;
    return { status, json };
  };
  const captured: { statusCode?: number; body?: Record<string, unknown> } = {};

  const host = {
    switchToHttp: () => ({
      getRequest: () => ({ url }),
      getResponse: () => ({ status, json }),
    }),
  } as unknown as ArgumentsHost;

  return { host, captured };
}

describe('DomainExceptionFilter', () => {
  const filter = new DomainExceptionFilter();

  it.each([
    [new InvalidCustomerIdError('Customer ID cannot be empty.'), 400, 'BadRequest'],
    [new InvalidEstablishmentIdError('Establishment ID cannot be empty.'), 400, 'BadRequest'],
    [new InvalidMoneyError('Invalid money value.'), 400, 'BadRequest'],
    [new InvalidQuantityError('Quantity must be greater than zero.'), 400, 'BadRequest'],
    [new OrderNotFoundError(), 404, 'NotFound'],
    [new OrderNotOwnedError('order-1'), 404, 'NotFound'],
    [new OrderStatusEmptyError(), 400, 'BadRequest'],
    [new InvalidOrderStatusError('UNKNOWN'), 400, 'BadRequest'],
    [new OrderMustHaveItemsError(), 400, 'BadRequest'],
    [new OrderItemNotFound('Order item not found.'), 404, 'NotFound'],
    [new ItemIdNotFound('Item ID not found.'), 404, 'NotFound'],
    [new OrderIdNotFound('Order ID not found.'), 404, 'NotFound'],
    [new OrderItemNameCannotBeEmpty('Order item name cannot be empty.'), 400, 'BadRequest'],
    [new OrderItemDoesNotBelongToOrderError('item-1', 'order-1'), 409, 'Conflict'],
    [new OrderItemCannotBeCreatedDirectlyError(), 400, 'BadRequest'],
  ])('maps %p to statusCode %i / error %s', (exception, statusCode, error) => {
    const { host, captured } = buildHost();

    filter.catch(exception as Error, host);

    expect(captured.statusCode).toBe(statusCode);
    expect(captured.body).toEqual({
      statusCode,
      message: exception.message,
      error,
      path: '/orders/123',
    });
  });

  it('includes the request path in the response body', () => {
    const { host, captured } = buildHost('/orders/42');

    filter.catch(new OrderNotFoundError(), host);

    expect(captured.body?.path).toBe('/orders/42');
  });
});
