import { InvalidMoneyError } from './money.errors';

export class Money {
  private constructor(readonly priceCents: bigint) {
    if (priceCents < 0n) throw new InvalidMoneyError('Money cannot be negative.');
  }

  static fromCents(value: bigint | string): Money {
    try {
      return new Money(BigInt(value));
    } catch {
      throw new InvalidMoneyError('Invalid money value.');
    }
  }

  static fromDecimal(input: string): Money {
    if (!/^\d+(\.\d{1,2})?$/.test(input)) throw new InvalidMoneyError('Invalid money format.');

    const [units, decimals = ''] = input.split('.');

    return new Money(BigInt(units) * 100n + BigInt(decimals.padEnd(2, '0')));
  }

  toCents(): bigint {
    return this.priceCents;
  }

  toDecimal(): string {
    const units = this.priceCents / 100n;
    const decimals = this.priceCents % 100n;

    return `${units}.${decimals.toString().padStart(2, '0')}`;
  }

  equals(other: Money): boolean {
    return this.priceCents === other.priceCents;
  }

  toString(): string {
    return this.toDecimal();
  }

  toJSON(): string {
    return this.toDecimal();
  }
}
