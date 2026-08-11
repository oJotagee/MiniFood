import { beforeEach, describe, expect, it } from 'bun:test';

import { InMemoryPasswordResetTokenRepository } from '../../support/in-memory-password-reset-token.repository';
import { ResetPasswordConfirmUseCase } from '@/application/use-cases/reset-password-confirm.use-case';
import { PasswordResetTokenEntity } from '@/domain/entities/password-reset-token.entity';
import { FakeIdentityProvider } from '../../support/fake-identity-provider';
import { FakeSecretGenerator } from '../../support/fake-secret-generator';
import {
  InvalidPasswordResetTokenError,
  PasswordResetTokenAlreadyUsedError,
  PasswordResetTokenExpiredError,
} from '@/domain/errors/password-reset-token.error';

describe('ResetPasswordConfirmUseCase', () => {
  let resetTokens: InMemoryPasswordResetTokenRepository;
  let identityProvider: FakeIdentityProvider;
  let useCase: ResetPasswordConfirmUseCase;

  beforeEach(() => {
    resetTokens = new InMemoryPasswordResetTokenRepository();
    identityProvider = new FakeIdentityProvider();
    useCase = new ResetPasswordConfirmUseCase(
      resetTokens,
      identityProvider,
      new FakeSecretGenerator(),
    );
  });

  it('sets the new password and marks the token as used', async () => {
    const rawToken = 'token-1';
    const entity = PasswordResetTokenEntity.issue({
      id: 'token-1',
      userId: 'user-1',
      tokenHash: 'hash:token-1',
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
    const rawToken = 'token-1';
    const entity = PasswordResetTokenEntity.issue({
      id: 'token-1',
      userId: 'user-1',
      tokenHash: 'hash:token-1',
    });
    await resetTokens.create(entity.markAsUsed());

    await expect(
      useCase.execute({ token: rawToken, newPassword: 'nova-senha-123' }),
    ).rejects.toThrow(PasswordResetTokenAlreadyUsedError);
  });

  it('rejects an expired token', async () => {
    const rawToken = 'token-1';
    const expired = PasswordResetTokenEntity.restore({
      id: 'token-1',
      userId: 'user-1',
      tokenHash: 'hash:token-1',
      expiresAt: new Date(Date.now() - 1000),
      createdAt: new Date(),
    });
    await resetTokens.create(expired);

    await expect(
      useCase.execute({ token: rawToken, newPassword: 'nova-senha-123' }),
    ).rejects.toThrow(PasswordResetTokenExpiredError);
  });
});
