import { InvalidCustomerIdError } from '../errors/customer-id.errors';

export class CustomerId {
  private constructor(readonly value: string) {
    if (!value) throw new InvalidCustomerIdError('Customer ID cannot be empty.');
    if (value.trim() === '') throw new InvalidCustomerIdError('Customer ID cannot be empty.');
  }

  static fromString(value: string): CustomerId {
    if (!value) throw new InvalidCustomerIdError('Customer ID cannot be empty.');
    if (value.trim() === '') throw new InvalidCustomerIdError('Customer ID cannot be empty.');

    return new CustomerId(value);
  }

  equals(other: CustomerId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
