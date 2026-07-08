export class InvalidProductCategoryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidProductCategoryError';
  }
}
