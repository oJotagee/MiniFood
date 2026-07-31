import { beforeEach, describe, expect, it } from 'bun:test';

import { ResetPasswordConfirmUseCase } from '@/application/use-cases/reset-password-confirm.use-case';
import { PasswordResetTokenEntity } from '@/domain/entities/password-reset-token.entity';
import {
  InvalidPasswordResetTokenError,
  PasswordResetTokenAlreadyUsedError,
  PasswordResetTokenExpiredError,
} from '@/domain/errors/password-reset-token.error';
import { InMemoryPasswordResetTokenRepository } from '../../support/in-memory-password-reset-token.repository';
import { FakeIdentityProvider } from '../../support/fake-identity-provider';

describe('ResetPasswordConfirmUseCase', () => {
  let resetTokens: InMemoryPasswordResetTokenRepository;
  let identityProvider: FakeIdentityProvider;
  let useCase: ResetPasswordConfirmUseCase;

  beforeEach(() => {
    resetTokens = new InMemoryPasswordResetTokenRepository();
    identityProvider = new FakeIdentityProvider();
    useCase = new ResetPasswordConfirmUseCase(resetTokens, identityProvider);
  });

  it('sets the new password and marks the token as used', async () => {
    const { entity, rawToken } = PasswordResetTokenEntity.issue({
      id: 'token-1',
      userId: 'user-1',
    });
    await resetTokens.create(entity);

    await useCase.execute({ token: rawToken, newPassword: 'nova-senha-123' });

    expect(identityProvider.setPasswordCalls).toEqual([
      { userId: 'user-1', newPassword: 'nova-senha-123' },
    ]);

    const persisted = await resetTokens.findByTokenHash(entity.tokenHash);
    expect(persisted?.usedAt).toBeInstanceOf(Date);
  });

  it('rejects an unknown token', async () => {
    await expect(
      useCase.execute({ token: 'unknown-token', newPassword: 'nova-senha-123' }),
    ).rejects.toThrow(InvalidPasswordResetTokenError);
  });

  it('rejects an already-used token', async () => {
    const { entity, rawToken } = PasswordResetTokenEntity.issue({
      id: 'token-1',
      userId: 'user-1',
    });
    await resetTokens.create(entity.markAsUsed());

    await expect(
      useCase.execute({ token: rawToken, newPassword: 'nova-senha-123' }),
    ).rejects.toThrow(PasswordResetTokenAlreadyUsedError);
  });

  it('rejects an expired token', async () => {
    const { rawToken } = PasswordResetTokenEntity.issue({ id: 'token-1', userId: 'user-1' });
    const expired = PasswordResetTokenEntity.restore({
      id: 'token-1',
      userId: 'user-1',
      tokenHash: PasswordResetTokenEntity.hash(rawToken),
      expiresAt: new Date(Date.now() - 1000),
      createdAt: new Date(),
    });
    await resetTokens.create(expired);

    await expect(
      useCase.execute({ token: rawToken, newPassword: 'nova-senha-123' }),
    ).rejects.toThrow(PasswordResetTokenExpiredError);
  });
});
