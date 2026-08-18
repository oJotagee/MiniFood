import { InvalidQuantityError } from '../errors/quantity.errors';

export class Quantity {
  private constructor(readonly quantity: number) {
    if (!Number.isInteger(quantity))
      throw new InvalidQuantityError('Quantity must be a valid integer.');
    if (quantity <= 0) throw new InvalidQuantityError('Quantity must be greater than zero.');
  }

  static from(value: number | string): Quantity {
    return new Quantity(Number(value));
  }

  equals(other: Quantity): boolean {
    return this.quantity === other.quantity;
  }

  toString(): string {
    return this.quantity.toString();
  }
}
