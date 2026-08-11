import { InvalidQuantityError } from '../errors/quantity.errors';

export class Quantity {
  private constructor(readonly quantity: bigint) {
    if (quantity <= 0n) throw new InvalidQuantityError('Quantity must be greater than zero.');
  }

  static from(value: bigint | string): Quantity {
    try {
      return new Quantity(BigInt(value));
    } catch {
      throw new InvalidQuantityError('Quantity must be a valid integer.');
    }
  }

  equals(other: Quantity): boolean {
    return this.quantity === other.quantity;
  }

  toString(): string {
    return this.quantity.toString();
  }
}
