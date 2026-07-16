import { describe, expect, it } from 'bun:test';

import { InvalidMoneyError } from '@/domain/errors/money.errors';
import { Money } from '@/domain/value-objects/money.vo';

describe('InvalidMoneyError', () => {
  it('sets the message and error name', () => {
    const error = new InvalidMoneyError('Money cannot be negative.');

    expect(error.message).toBe('Money cannot be negative.');
    expect(error.name).toBe('InvalidMoneyError');
    expect(error).toBeInstanceOf(Error);
  });
});

describe('Money', () => {
  describe('fromCents', () => {
    it('creates money from a bigint value', () => {
      const money = Money.fromCents(2590n);

      expect(money.toCents()).toBe(2590n);
    });

    it('creates money from a numeric string', () => {
      const money = Money.fromCents('2590');

      expect(money.toCents()).toBe(2590n);
    });

    it('rejects negative values', () => {
      expect(() => Money.fromCents(-1n)).toThrow(InvalidMoneyError);
    });

    it('rejects invalid values', () => {
      expect(() => Money.fromCents('not-a-number')).toThrow(InvalidMoneyError);
    });
  });

  describe('fromDecimal', () => {
    it('creates money from a decimal string with two digits', () => {
      const money = Money.fromDecimal('25.90');

      expect(money.toCents()).toBe(2590n);
    });

    it('creates money from a decimal string with one digit', () => {
      const money = Money.fromDecimal('25.9');

      expect(money.toCents()).toBe(2590n);
    });

    it('creates money from an integer string without decimals', () => {
      const money = Money.fromDecimal('25');

      expect(money.toCents()).toBe(2500n);
    });

    it('rejects an invalid decimal format', () => {
      expect(() => Money.fromDecimal('25.900')).toThrow(InvalidMoneyError);
      expect(() => Money.fromDecimal('abc')).toThrow(InvalidMoneyError);
      expect(() => Money.fromDecimal('-25.90')).toThrow(InvalidMoneyError);
    });
  });

  describe('toDecimal / toString / toJSON', () => {
    it('formats cents as a decimal string', () => {
      const money = Money.fromCents(2590n);

      expect(money.toDecimal()).toBe('25.90');
      expect(money.toString()).toBe('25.90');
      expect(money.toJSON()).toBe('25.90');
    });

    it('pads single-digit cents', () => {
      const money = Money.fromCents(2505n);

      expect(money.toDecimal()).toBe('25.05');
    });

    it('formats zero cents', () => {
      const money = Money.fromCents(0n);

      expect(money.toDecimal()).toBe('0.00');
    });
  });

  describe('equals', () => {
    it('returns true for equal amounts', () => {
      expect(Money.fromCents(2590n).equals(Money.fromCents(2590n))).toBe(true);
    });

    it('returns false for different amounts', () => {
      expect(Money.fromCents(2590n).equals(Money.fromCents(1000n))).toBe(false);
    });
  });
});
