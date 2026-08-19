import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';

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

type HttpResponse = {
  status: (statusCode: number) => HttpResponse;
  json: (body: Record<string, unknown>) => void;
};

type HttpRequest = {
  url: string;
};

type DomainError =
  | InvalidCustomerIdError
  | InvalidEstablishmentIdError
  | InvalidMoneyError
  | InvalidQuantityError
  | OrderNotFoundError
  | OrderNotOwnedError
  | OrderStatusEmptyError
  | InvalidOrderStatusError
  | OrderMustHaveItemsError
  | OrderItemNotFound
  | ItemIdNotFound
  | OrderIdNotFound
  | OrderItemNameCannotBeEmpty
  | OrderItemDoesNotBelongToOrderError
  | OrderItemCannotBeCreatedDirectlyError;

const STATUS_BY_ERROR = new Map<Function, { statusCode: number; error: string }>([
  [InvalidCustomerIdError, { statusCode: HttpStatus.BAD_REQUEST, error: 'BadRequest' }],
  [InvalidEstablishmentIdError, { statusCode: HttpStatus.BAD_REQUEST, error: 'BadRequest' }],
  [InvalidMoneyError, { statusCode: HttpStatus.BAD_REQUEST, error: 'BadRequest' }],
  [InvalidQuantityError, { statusCode: HttpStatus.BAD_REQUEST, error: 'BadRequest' }],
  [OrderNotFoundError, { statusCode: HttpStatus.NOT_FOUND, error: 'NotFound' }],
  [OrderNotOwnedError, { statusCode: HttpStatus.NOT_FOUND, error: 'NotFound' }],
  [OrderStatusEmptyError, { statusCode: HttpStatus.BAD_REQUEST, error: 'BadRequest' }],
  [InvalidOrderStatusError, { statusCode: HttpStatus.BAD_REQUEST, error: 'BadRequest' }],
  [OrderMustHaveItemsError, { statusCode: HttpStatus.BAD_REQUEST, error: 'BadRequest' }],
  [OrderItemNotFound, { statusCode: HttpStatus.NOT_FOUND, error: 'NotFound' }],
  [ItemIdNotFound, { statusCode: HttpStatus.NOT_FOUND, error: 'NotFound' }],
  [OrderIdNotFound, { statusCode: HttpStatus.NOT_FOUND, error: 'NotFound' }],
  [OrderItemNameCannotBeEmpty, { statusCode: HttpStatus.BAD_REQUEST, error: 'BadRequest' }],
  [OrderItemDoesNotBelongToOrderError, { statusCode: HttpStatus.CONFLICT, error: 'Conflict' }],
  [
    OrderItemCannotBeCreatedDirectlyError,
    { statusCode: HttpStatus.BAD_REQUEST, error: 'BadRequest' },
  ],
]);

@Catch(
  InvalidCustomerIdError,
  InvalidEstablishmentIdError,
  InvalidMoneyError,
  InvalidQuantityError,
  OrderNotFoundError,
  OrderNotOwnedError,
  OrderStatusEmptyError,
  InvalidOrderStatusError,
  OrderMustHaveItemsError,
  OrderItemNotFound,
  ItemIdNotFound,
  OrderIdNotFound,
  OrderItemNameCannotBeEmpty,
  OrderItemDoesNotBelongToOrderError,
  OrderItemCannotBeCreatedDirectlyError,
)
export class DomainExceptionFilter implements ExceptionFilter<DomainError> {
  catch(exception: DomainError, host: ArgumentsHost): void {
    const mapping = STATUS_BY_ERROR.get(exception.constructor) ?? {
      statusCode: HttpStatus.BAD_REQUEST,
      error: 'BadRequest',
    };

    const request = host.switchToHttp().getRequest<HttpRequest>();
    const response = host.switchToHttp().getResponse<HttpResponse>();

    response.status(mapping.statusCode).json({
      statusCode: mapping.statusCode,
      message: exception.message,
      error: mapping.error,
      path: request.url,
    });
  }
}
