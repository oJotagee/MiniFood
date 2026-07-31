import { describe, expect, it } from 'bun:test';

import { TwoFactorChallengeEntity } from '@/domain/entities/two-factor-challenge.entity';
import {
  InvalidTwoFactorChallengeError,
  TwoFactorChallengeAlreadyUsedError,
  TwoFactorChallengeExpiredError,
  TwoFactorChallengeTooManyAttemptsError,
} from '@/domain/errors/two-factor-challenge.error';

function issue() {
  return TwoFactorChallengeEntity.issue({
    id: 'challenge-1',
    userId: 'user-1',
    encryptedRefreshToken: 'encrypted-token',
  });
}

describe('TwoFactorChallengeEntity', () => {
  it('issues a challenge with a 6-digit raw code and a matching hash', () => {
    const { entity, rawCode } = issue();

    expect(rawCode).toMatch(/^\d{6}$/);
    expect(entity.codeHash).toBe(TwoFactorChallengeEntity.hash(rawCode));
    expect(entity.attempts).toBe(0);
    expect(entity.consumedAt).toBeUndefined();
  });

  it('verify succeeds with the correct code', () => {
    const { entity, rawCode } = issue();

    const result = entity.verify(rawCode);

    expect(result.outcome).toBe('valid');
    expect(result.challenge.consumedAt).toBeInstanceOf(Date);
  });

  it('verify returns invalid_code and increments attempts on a wrong code', () => {
    const { entity } = issue();

    const result = entity.verify('000000');

    expect(result.outcome).toBe('invalid_code');
    expect(result.challenge.attempts).toBe(1);
    expect(result.challenge.consumedAt).toBeUndefined();
  });

  it('does not mutate the original entity when verifying', () => {
    const { entity } = issue();

    entity.verify('000000');

    expect(entity.attempts).toBe(0);
  });

  it('assertCanAttempt rejects an already-consumed challenge', () => {
    const { entity, rawCode } = issue();
    const { challenge: consumed } = entity.verify(rawCode);

    expect(() => consumed.assertCanAttempt()).toThrow(TwoFactorChallengeAlreadyUsedError);
  });

  it('assertCanAttempt rejects an expired challenge', () => {
    const expired = TwoFactorChallengeEntity.restore({
      id: 'challenge-1',
      userId: 'user-1',
      codeHash: TwoFactorChallengeEntity.hash('123456'),
      encryptedRefreshToken: 'encrypted-token',
      expiresAt: new Date(Date.now() - 1000),
      attempts: 0,
      createdAt: new Date(),
    });

    expect(() => expired.assertCanAttempt()).toThrow(TwoFactorChallengeExpiredError);
  });

  it('assertCanAttempt rejects a challenge with too many attempts', () => {
    const maxedOut = TwoFactorChallengeEntity.restore({
      id: 'challenge-1',
      userId: 'user-1',
      codeHash: TwoFactorChallengeEntity.hash('123456'),
      encryptedRefreshToken: 'encrypted-token',
      expiresAt: new Date(Date.now() + 60_000),
      attempts: 5,
      createdAt: new Date(),
    });

    expect(() => maxedOut.assertCanAttempt()).toThrow(TwoFactorChallengeTooManyAttemptsError);
  });

  it('rejects blank fields', () => {
    expect(() =>
      TwoFactorChallengeEntity.restore({
        id: '',
        userId: 'user-1',
        codeHash: 'hash',
        encryptedRefreshToken: 'encrypted-token',
        expiresAt: new Date(),
        attempts: 0,
        createdAt: new Date(),
      }),
    ).toThrow(InvalidTwoFactorChallengeError);
  });
});
