import { describe, expect, it } from 'bun:test';
import type { ArgumentsHost } from '@nestjs/common';

import { AddressError } from '@/domain/errors/address.error';
import {
  EstablishmentNotFoundError,
  EstablishmentNotOwnedError,
  InvalidEstablishmentDataError,
} from '@/domain/errors/establishment.error';
import { InvalidMoneyError } from '@/domain/errors/money.errors';
import {
  InvalidProductCategoryError,
  ProductCategoryNotFoundError,
} from '@/domain/errors/product-category.errors';
import {
  InvalidProductError,
  ProductAlreadyDeactivatedError,
  ProductNotFoundError,
} from '@/domain/errors/product.errors';
import { DomainExceptionFilter } from '@/presentation/filters/domain-exception.filter';

function buildHost(url = '/establishments/123') {
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
    [new AddressError('Invalid zip code.'), 400, 'BadRequest'],
    [new InvalidMoneyError('Invalid money format.'), 400, 'BadRequest'],
    [new InvalidEstablishmentDataError('name is required'), 400, 'BadRequest'],
    [new EstablishmentNotFoundError('est-1'), 404, 'NotFound'],
    [new EstablishmentNotOwnedError('est-1'), 404, 'NotFound'],
    [new InvalidProductError('price must be positive'), 400, 'BadRequest'],
    [new ProductNotFoundError('prod-1'), 404, 'NotFound'],
    [new ProductAlreadyDeactivatedError('prod-1'), 409, 'Conflict'],
    [new InvalidProductCategoryError('name is required'), 400, 'BadRequest'],
    [new ProductCategoryNotFoundError('cat-1'), 404, 'NotFound'],
  ])('maps %p to statusCode %i / error %s', (exception, statusCode, error) => {
    const { host, captured } = buildHost();

    filter.catch(exception as Error, host);

    expect(captured.statusCode).toBe(statusCode);
    expect(captured.body).toEqual({
      statusCode,
      message: exception.message,
      error,
      path: '/establishments/123',
    });
  });

  it('includes the request path in the response body', () => {
    const { host, captured } = buildHost('/products/42');

    filter.catch(new ProductNotFoundError('42'), host);

    expect(captured.body?.path).toBe('/products/42');
  });
});
