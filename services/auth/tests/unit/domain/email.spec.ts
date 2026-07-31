import { describe, expect, it } from 'bun:test';

import { InvalidEmailError } from '@/domain/errors/email.error';
import { Email } from '@/domain/value-objects/email.vo';

describe('Email', () => {
  it('creates a valid email', () => {
    const email = Email.create({ value: 'joao@example.com' });

    expect(email.toString()).toBe('joao@example.com');
    expect(email.value).toBe('joao@example.com');
  });

  it('trims whitespace', () => {
    const email = Email.create({ value: '  joao@example.com  ' });

    expect(email.toString()).toBe('joao@example.com');
  });

  it('rejects an empty value', () => {
    expect(() => Email.create({ value: '' })).toThrow(InvalidEmailError);
    expect(() => Email.create({ value: '   ' })).toThrow(InvalidEmailError);
  });

  it('rejects a malformed email', () => {
    expect(() => Email.create({ value: 'not-an-email' })).toThrow(InvalidEmailError);
    expect(() => Email.create({ value: 'missing-domain@' })).toThrow(InvalidEmailError);
    expect(() => Email.create({ value: '@missing-local.com' })).toThrow(InvalidEmailError);
  });

  it('compares equality by value', () => {
    const a = Email.create({ value: 'joao@example.com' });
    const b = Email.create({ value: 'joao@example.com' });
    const c = Email.create({ value: 'maria@example.com' });

    expect(a.equals(b)).toBe(true);
    expect(a.equals(c)).toBe(false);
  });

  it('serializes to JSON', () => {
    const email = Email.create({ value: 'joao@example.com' });

    expect(email.toJSON()).toEqual({ value: 'joao@example.com' });
  });
});
