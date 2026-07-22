import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';

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

type HttpResponse = {
  status: (statusCode: number) => HttpResponse;
  json: (body: Record<string, unknown>) => void;
};

type HttpRequest = {
  url: string;
};

type DomainError =
  | AddressError
  | InvalidMoneyError
  | InvalidEstablishmentDataError
  | EstablishmentNotFoundError
  | EstablishmentNotOwnedError
  | InvalidProductError
  | ProductNotFoundError
  | ProductAlreadyDeactivatedError
  | InvalidProductCategoryError
  | ProductCategoryNotFoundError;

// EstablishmentNotOwnedError vira 404 (nao 403): nao revela a terceiros que o recurso existe.
const STATUS_BY_ERROR = new Map<Function, { statusCode: number; error: string }>([
  [AddressError, { statusCode: HttpStatus.BAD_REQUEST, error: 'BadRequest' }],
  [InvalidMoneyError, { statusCode: HttpStatus.BAD_REQUEST, error: 'BadRequest' }],
  [InvalidEstablishmentDataError, { statusCode: HttpStatus.BAD_REQUEST, error: 'BadRequest' }],
  [EstablishmentNotFoundError, { statusCode: HttpStatus.NOT_FOUND, error: 'NotFound' }],
  [EstablishmentNotOwnedError, { statusCode: HttpStatus.NOT_FOUND, error: 'NotFound' }],
  [InvalidProductError, { statusCode: HttpStatus.BAD_REQUEST, error: 'BadRequest' }],
  [ProductNotFoundError, { statusCode: HttpStatus.NOT_FOUND, error: 'NotFound' }],
  [ProductAlreadyDeactivatedError, { statusCode: HttpStatus.CONFLICT, error: 'Conflict' }],
  [InvalidProductCategoryError, { statusCode: HttpStatus.BAD_REQUEST, error: 'BadRequest' }],
  [ProductCategoryNotFoundError, { statusCode: HttpStatus.NOT_FOUND, error: 'NotFound' }],
]);

@Catch(
  AddressError,
  InvalidMoneyError,
  InvalidEstablishmentDataError,
  EstablishmentNotFoundError,
  EstablishmentNotOwnedError,
  InvalidProductError,
  ProductNotFoundError,
  ProductAlreadyDeactivatedError,
  InvalidProductCategoryError,
  ProductCategoryNotFoundError,
)
export class DomainExceptionFilter implements ExceptionFilter<DomainError> {
  catch(exception: DomainError, host: ArgumentsHost): void {
    // Traduz erro de dominio para HTTP sem acoplar use case ao NestJS.
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
