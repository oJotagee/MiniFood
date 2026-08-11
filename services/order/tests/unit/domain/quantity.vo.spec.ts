import { describe, expect, it } from 'bun:test';

import { InvalidQuantityError } from '@/domain/errors/quantity.errors';
import { Quantity } from '@/domain/value-objects/quantity.vo';

describe('InvalidQuantityError', () => {
  it('sets the message and error name', () => {
    const error = new InvalidQuantityError('Quantity must be greater than zero.');

    expect(error.message).toBe('Quantity must be greater than zero.');
    expect(error.name).toBe('InvalidQuantityError');
    expect(error).toBeInstanceOf(Error);
  });
});

describe('Quantity', () => {
  describe('from', () => {
    it('creates a positive quantity from a bigint value', () => {
      expect(Quantity.from(2n).toString()).toBe('2');
    });

    it('creates a positive quantity from a numeric string', () => {
      expect(Quantity.from('3').toString()).toBe('3');
    });

    it('rejects zero', () => {
      expect(() => Quantity.from(0n)).toThrow(InvalidQuantityError);
    });

    it('rejects negative values', () => {
      expect(() => Quantity.from(-1n)).toThrow(InvalidQuantityError);
    });

    it('rejects non-integer values', () => {
      expect(() => Quantity.from('1.5')).toThrow(InvalidQuantityError);
    });

    it('rejects non-numeric strings', () => {
      expect(() => Quantity.from('abc')).toThrow(InvalidQuantityError);
    });
  });

  describe('equals', () => {
    it('returns true for equal quantities', () => {
      expect(Quantity.from(2n).equals(Quantity.from(2n))).toBe(true);
    });

    it('returns false for different quantities', () => {
      expect(Quantity.from(2n).equals(Quantity.from(3n))).toBe(false);
    });
  });

  describe('toString', () => {
    it('returns the quantity as a string', () => {
      expect(Quantity.from(5n).toString()).toBe('5');
    });
  });
});
