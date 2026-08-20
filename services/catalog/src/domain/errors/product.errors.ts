export class InvalidProductError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidProductError';
  }
}

export class ProductAlreadyDeactivatedError extends Error {
  constructor(productId: string) {
    super(`Product with id ${productId} is already deactivated.`);
    this.name = 'ProductAlreadyDeactivatedError';
  }
}

export class ProductAlreadyActivatedError extends Error {
  constructor(productId: string) {
    super(`Product with id ${productId} is already activated.`);
    this.name = 'ProductAlreadyActivatedError';
  }
}

export class ProductNotFoundError extends Error {
  constructor(productId: string) {
    super(`Product with id ${productId} not found.`);
    this.name = 'ProductNotFoundError';
  }
}

export class ProductNotAvailableError extends Error {
  constructor(productId: string) {
    super(`Product with id ${productId} is not available.`);
    this.name = 'ProductNotAvailableError';
  }
}

export class ProductBelongsToAnotherEstablishmentError extends Error {
  constructor(productId: string, establishmentId: string) {
    super(`Product with id ${productId} does not belong to establishment ${establishmentId}.`);
    this.name = 'ProductBelongsToAnotherEstablishmentError';
  }
}
