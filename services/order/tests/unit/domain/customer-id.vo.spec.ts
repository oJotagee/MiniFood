import { describe, expect, it } from 'bun:test';

import { InvalidCustomerIdError } from '@/domain/errors/customer-id.errors';
import { CustomerId } from '@/domain/value-objects/customer-id.vo';

describe('CustomerId', () => {
  it('creates and compares identifiers by value', () => {
    const customerId = CustomerId.fromString('customer-1');

    expect(customerId.toString()).toBe('customer-1');
    expect(customerId.equals(CustomerId.fromString('customer-1'))).toBe(true);
    expect(customerId.equals(CustomerId.fromString('customer-2'))).toBe(false);
  });

  it('rejects an empty identifier', () => {
    expect(() => CustomerId.fromString('')).toThrow(InvalidCustomerIdError);
  });
});
