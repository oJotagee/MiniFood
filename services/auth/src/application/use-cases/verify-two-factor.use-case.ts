import { Inject, Injectable } from '@nestjs/common';

import type { TwoFactorChallengeRepository } from '../port/two-factor-challenge-repository.port';
import { TWO_FACTOR_CHALLENGE_REPOSITORY } from '../port/two-factor-challenge-repository.port';
import type { IdentityProvider, IdentityTokens } from '../port/identity-provider.port';
import { TokenCipher } from '@/infrastructure/security/token-cipher';
import { IDENTITY_PROVIDER } from '../port/identity-provider.port';
import {
  InvalidTwoFactorChallengeError,
  InvalidTwoFactorCodeError,
} from '@/domain/errors/two-factor-challenge.error';

type VerifyTwoFactorInput = {
  challengeId: string;
  code: string;
};

@Injectable()
export class VerifyTwoFactorUseCase {
  constructor(
    @Inject(TWO_FACTOR_CHALLENGE_REPOSITORY)
    private readonly challenges: TwoFactorChallengeRepository,

    @Inject(IDENTITY_PROVIDER)
    private readonly identityProvider: IdentityProvider,
    private readonly tokenCipher: TokenCipher,
  ) { }

  async execute(input: VerifyTwoFactorInput): Promise<IdentityTokens> {
    const challenge = await this.challenges.findById(input.challengeId);

    if (!challenge) throw new InvalidTwoFactorChallengeError('Challenge not found.');

    const result = challenge.verify(input.code);

    await this.challenges.update(result.challenge);

    if (result.outcome === 'invalid_code') {
      throw new InvalidTwoFactorCodeError();
    }

    const refreshToken = this.tokenCipher.decrypt(challenge.encryptedRefreshToken);

    return this.identityProvider.refreshToken(refreshToken);
  }
}
