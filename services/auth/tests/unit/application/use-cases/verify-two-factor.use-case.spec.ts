import { beforeEach, describe, expect, it } from 'bun:test';

import { InMemoryTwoFactorChallengeRepository } from '../../support/in-memory-two-factor-challenge.repository';
import { VerifyTwoFactorUseCase } from '@/application/use-cases/verify-two-factor.use-case';
import { TwoFactorChallengeEntity } from '@/domain/entities/two-factor-challenge.entity';
import { FakeIdentityProvider } from '../../support/fake-identity-provider';
import { TokenCipher } from '@/infrastructure/security/token-cipher';
import {
  InvalidTwoFactorChallengeError,
  InvalidTwoFactorCodeError,
  TwoFactorChallengeAlreadyUsedError,
} from '@/domain/errors/two-factor-challenge.error';

describe('VerifyTwoFactorUseCase', () => {
  let challenges: InMemoryTwoFactorChallengeRepository;
  let identityProvider: FakeIdentityProvider;
  let tokenCipher: TokenCipher;
  let useCase: VerifyTwoFactorUseCase;

  beforeEach(() => {
    challenges = new InMemoryTwoFactorChallengeRepository();
    identityProvider = new FakeIdentityProvider();
    tokenCipher = new TokenCipher();
    useCase = new VerifyTwoFactorUseCase(challenges, identityProvider, tokenCipher);
  });

  it('exchanges the encrypted refresh token for fresh tokens on a correct code', async () => {
    const { entity, rawCode } = TwoFactorChallengeEntity.issue({
      id: 'challenge-1',
      userId: 'user-1',
      encryptedRefreshToken: tokenCipher.encrypt('the-real-refresh-token'),
    });
    await challenges.create(entity);

    const result = await useCase.execute({ challengeId: 'challenge-1', code: rawCode });

    expect(result).toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      expiresIn: 300,
    });
    expect(identityProvider.refreshTokenCalls).toEqual(['the-real-refresh-token']);
  });

  it('rejects an incorrect code and persists the failed attempt', async () => {
    const { entity } = TwoFactorChallengeEntity.issue({
      id: 'challenge-1',
      userId: 'user-1',
      encryptedRefreshToken: tokenCipher.encrypt('token'),
    });
    await challenges.create(entity);

    await expect(useCase.execute({ challengeId: 'challenge-1', code: '000000' })).rejects.toThrow(
      InvalidTwoFactorCodeError,
    );

    const persisted = await challenges.findById('challenge-1');
    expect(persisted?.attempts).toBe(1);
  });

  it('rejects when the challenge does not exist', async () => {
    await expect(useCase.execute({ challengeId: 'missing', code: '123456' })).rejects.toThrow(
      InvalidTwoFactorChallengeError,
    );
  });

  it('rejects a code for an already-consumed challenge', async () => {
    const { entity, rawCode } = TwoFactorChallengeEntity.issue({
      id: 'challenge-1',
      userId: 'user-1',
      encryptedRefreshToken: tokenCipher.encrypt('token'),
    });
    await challenges.create(entity);
    await useCase.execute({ challengeId: 'challenge-1', code: rawCode });

    await expect(useCase.execute({ challengeId: 'challenge-1', code: rawCode })).rejects.toThrow(
      TwoFactorChallengeAlreadyUsedError,
    );
  });
});
