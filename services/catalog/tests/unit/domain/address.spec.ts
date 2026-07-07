import { describe, expect, it } from 'bun:test';

import { AddressError } from '../../../src/domain/address/address.error';
import { Address } from '../../../src/domain/address/address.vo';

describe('Address', () => {
  it('creates an address with catalog fields', () => {
    const address = Address.create({
      street: 'Main St',
      number: '100',
      complement: 'Apt 1',
      neighborhood: 'Center',
      city: 'Sao Paulo',
      state: 'SP',
      zipCode: '01000-000',
    });

    expect(address.toJSON()).toEqual({
      street: 'Main St',
      number: '100',
      complement: 'Apt 1',
      neighborhood: 'Center',
      city: 'Sao Paulo',
      state: 'SP',
      zipCode: '01000-000',
    });
  });

  it('rejects missing required fields', () => {
    expect(() =>
      Address.create({
        street: '',
        number: '100',
        neighborhood: 'Center',
        city: 'Sao Paulo',
        state: 'SP',
        zipCode: '01000-000',
      }),
    ).toThrow(AddressError);
  });
});
