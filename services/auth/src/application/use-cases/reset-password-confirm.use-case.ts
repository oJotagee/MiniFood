import { Inject, Injectable } from '@nestjs/common';

import type { PasswordResetTokenRepository } from '../port/password-reset-token-repository.port';
import { PASSWORD_RESET_TOKEN_REPOSITORY } from '../port/password-reset-token-repository.port';
import { InvalidPasswordResetTokenError } from '@/domain/errors/password-reset-token.error';
import { PasswordResetTokenEntity } from '@/domain/entities/password-reset-token.entity';
import type { IdentityProvider } from '../port/identity-provider.port';
import { IDENTITY_PROVIDER } from '../port/identity-provider.port';

type ResetPasswordConfirmInput = {
  token: string;
  newPassword: string;
};

@Injectable()
export class ResetPasswordConfirmUseCase {
  constructor(
    @Inject(PASSWORD_RESET_TOKEN_REPOSITORY)
    private readonly resetTokens: PasswordResetTokenRepository,

    @Inject(IDENTITY_PROVIDER)
    private readonly identityProvider: IdentityProvider,
  ) {}

  async execute(input: ResetPasswordConfirmInput): Promise<void> {
    const tokenHash = PasswordResetTokenEntity.hash(input.token);
    const resetToken = await this.resetTokens.findByTokenHash(tokenHash);

    if (!resetToken) throw new InvalidPasswordResetTokenError('Reset token is invalid.');

    resetToken.assertUsable();

    await this.identityProvider.setPassword(resetToken.userId, input.newPassword);

    await this.resetTokens.markAsUsed(resetToken.markAsUsed());
  }
}
