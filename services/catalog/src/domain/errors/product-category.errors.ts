export class InvalidProductCategoryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidProductCategoryError';
  }
}

export class ProductCategoryNotFoundError extends Error {
  constructor(id: string) {
    super(`Product category with ID ${id} not found`);
    this.name = 'ProductCategoryNotFoundError';
  }
}
