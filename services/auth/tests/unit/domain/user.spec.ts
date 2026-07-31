import { describe, expect, it } from 'bun:test';

import { InvalidUserError } from '@/domain/errors/user.error';
import { UserEntity } from '@/domain/entities/user.entity';
import { Email } from '@/domain/value-objects/email.vo';

const email = Email.create({ value: 'joao@example.com' });

describe('UserEntity', () => {
  it('creates a user with twoFactorEnabled=false and records a registered event', () => {
    const user = UserEntity.create({
      id: 'user-1',
      name: 'Joao',
      email,
      role: 'customer',
    });

    expect(user.twoFactorEnabled).toBe(false);
    expect(user.pullDomainEvents()).toEqual([
      {
        type: 'user.registered',
        occurredAt: user.createdAt,
        payload: {
          userId: 'user-1',
          email: 'joao@example.com',
          name: 'Joao',
          role: 'customer',
        },
      },
    ]);
    expect(user.pullDomainEvents()).toEqual([]);
  });

  it('updates profile and records an update event', () => {
    const user = UserEntity.create({ id: 'user-1', name: 'Joao', email, role: 'customer' });
    user.pullDomainEvents();

    const updated = user.updateProfile({ name: 'Joao Silva' });

    expect(updated.name).toBe('Joao Silva');
    expect(updated.pullDomainEvents()).toEqual([
      {
        type: 'user.profile-updated',
        occurredAt: updated.updatedAt,
        payload: {
          userId: 'user-1',
          email: 'joao@example.com',
          name: 'Joao Silva',
        },
      },
    ]);
  });

  it('keeps twoFactorEnabled unchanged when updating profile', () => {
    const user = UserEntity.create({ id: 'user-1', name: 'Joao', email, role: 'customer' });
    const withTwoFactor = user.setTwoFactorEnabled(true);

    const updated = withTwoFactor.updateProfile({ name: 'Joao Silva' });

    expect(updated.twoFactorEnabled).toBe(true);
  });

  it('toggles twoFactorEnabled without emitting domain events', () => {
    const user = UserEntity.create({ id: 'user-1', name: 'Joao', email, role: 'customer' });
    user.pullDomainEvents();

    const enabled = user.setTwoFactorEnabled(true);

    expect(enabled.twoFactorEnabled).toBe(true);
    expect(enabled.pullDomainEvents()).toEqual([]);
  });

  it('restores a user without recording domain events', () => {
    const createdAt = new Date('2026-01-01T00:00:00.000Z');
    const updatedAt = new Date('2026-01-02T00:00:00.000Z');

    const user = UserEntity.restore({
      id: 'user-1',
      name: 'Joao',
      email,
      role: 'customer',
      twoFactorEnabled: true,
      createdAt,
      updatedAt,
    });

    expect(user.createdAt).toBe(createdAt);
    expect(user.updatedAt).toBe(updatedAt);
    expect(user.twoFactorEnabled).toBe(true);
    expect(user.pullDomainEvents()).toEqual([]);
  });

  it('rejects blank id', () => {
    expect(() => UserEntity.create({ id: '', name: 'Joao', email, role: 'customer' })).toThrow(
      InvalidUserError,
    );
  });

  it('rejects blank name', () => {
    expect(() => UserEntity.create({ id: 'user-1', name: '', email, role: 'customer' })).toThrow(
      InvalidUserError,
    );
  });
});
