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

export class ProductNotFoundError extends Error {
  constructor(productId: string) {
    super(`Product with id ${productId} not found.`);
    this.name = 'ProductNotFoundError';
  }
}