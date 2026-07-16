import { describe, expect, it } from 'bun:test';

import { AddressError } from '@/domain/errors/address.error';
import { Address } from '@/domain/value-objects/address.vo';

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

  it('trims fields and drops blank complement', () => {
    const address = Address.create({
      street: '  Main St  ',
      number: ' 100 ',
      complement: '   ',
      neighborhood: ' Center ',
      city: ' Sao Paulo ',
      state: ' SP ',
      zipCode: ' 01000-000 ',
    });

    expect(address.toJSON()).toEqual({
      street: 'Main St',
      number: '100',
      complement: undefined,
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

  it('compares two addresses by value', () => {
    const props = {
      street: 'Main St',
      number: '100',
      neighborhood: 'Center',
      city: 'Sao Paulo',
      state: 'SP',
      zipCode: '01000-000',
    };

    const a = Address.create(props);
    const b = Address.create(props);
    const c = Address.create({ ...props, city: 'Rio de Janeiro' });

    expect(a.equals(b)).toBe(true);
    expect(a.equals(c)).toBe(false);
  });

  it('formats a readable string with complement', () => {
    const address = Address.create({
      street: 'Main St',
      number: '100',
      complement: 'Apt 1',
      neighborhood: 'Center',
      city: 'Sao Paulo',
      state: 'SP',
      zipCode: '01000-000',
    });

    expect(address.toString()).toBe('Main St, 100, Apt 1, Center, Sao Paulo, SP, 01000-000');
  });

  it('formats a readable string without complement', () => {
    const address = Address.create({
      street: 'Main St',
      number: '100',
      neighborhood: 'Center',
      city: 'Sao Paulo',
      state: 'SP',
      zipCode: '01000-000',
    });

    expect(address.toString()).toBe('Main St, 100, Center, Sao Paulo, SP, 01000-000');
  });
});
