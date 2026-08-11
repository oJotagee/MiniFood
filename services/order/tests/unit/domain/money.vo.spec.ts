import { describe, expect, it } from 'bun:test';

import { InvalidMoneyError } from '@/domain/errors/money.errors';
import { Money } from '@/domain/value-objects/money.vo';

describe('Money', () => {
  it('creates exact amounts from cents and decimal strings', () => {
    expect(Money.fromCents('1050').toCents()).toBe(1050n);
    expect(Money.fromDecimal('10.50').toCents()).toBe(1050n);
    expect(Money.fromDecimal('10.5').toDecimal()).toBe('10.50');
  });

  it('rejects negative or malformed monetary values', () => {
    expect(() => Money.fromCents(-1n)).toThrow(InvalidMoneyError);
    expect(() => Money.fromCents('not-a-number')).toThrow(InvalidMoneyError);
    expect(() => Money.fromDecimal('10.999')).toThrow(InvalidMoneyError);
  });

  it('compares values and serializes without precision loss', () => {
    const amount = Money.fromCents('9007199254740993');

    expect(amount.equals(Money.fromCents(9007199254740993n))).toBe(true);
    expect(amount.toJSON()).toBe('90071992547409.93');
  });
});
