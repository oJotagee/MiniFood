import { describe, expect, it } from 'bun:test';

import { PasswordResetTokenEntity } from '@/domain/entities/password-reset-token.entity';
import {
  InvalidPasswordResetTokenError,
  PasswordResetTokenAlreadyUsedError,
  PasswordResetTokenExpiredError,
} from '@/domain/errors/password-reset-token.error';

describe('PasswordResetTokenEntity', () => {
  it('issues a token with the hash generated outside the domain', () => {
    const entity = PasswordResetTokenEntity.issue({
      id: 'token-1',
      userId: 'user-1',
      tokenHash: 'hash:token-1',
    });

    expect(entity.userId).toBe('user-1');
    expect(entity.tokenHash).toBe('hash:token-1');
    expect(entity.usedAt).toBeUndefined();
    expect(entity.expiresAt.getTime()).toBeGreaterThan(Date.now());
  });

  it('marks a token as used', () => {
    const entity = PasswordResetTokenEntity.issue({
      id: 'token-1',
      userId: 'user-1',
      tokenHash: 'hash:token-1',
    });

    const used = entity.markAsUsed();

    expect(used.usedAt).toBeInstanceOf(Date);
  });

  it('assertUsable rejects an already-used token', () => {
    const entity = PasswordResetTokenEntity.issue({
      id: 'token-1',
      userId: 'user-1',
      tokenHash: 'hash:token-1',
    });
    const used = entity.markAsUsed();

    expect(() => used.assertUsable()).toThrow(PasswordResetTokenAlreadyUsedError);
  });

  it('markAsUsed rejects an already-used token', () => {
    const entity = PasswordResetTokenEntity.issue({
      id: 'token-1',
      userId: 'user-1',
      tokenHash: 'hash:token-1',
    });
    const used = entity.markAsUsed();

    expect(() => used.markAsUsed()).toThrow(PasswordResetTokenAlreadyUsedError);
  });

  it('assertUsable rejects an expired token', () => {
    const token = PasswordResetTokenEntity.restore({
      id: 'token-1',
      userId: 'user-1',
      tokenHash: 'hash',
      expiresAt: new Date(Date.now() - 1000),
      createdAt: new Date(),
    });

    expect(() => token.assertUsable()).toThrow(PasswordResetTokenExpiredError);
  });

  it('rejects blank fields', () => {
    expect(() =>
      PasswordResetTokenEntity.restore({
        id: '',
        userId: 'user-1',
        tokenHash: 'hash',
        expiresAt: new Date(),
        createdAt: new Date(),
      }),
    ).toThrow(InvalidPasswordResetTokenError);
  });
});
