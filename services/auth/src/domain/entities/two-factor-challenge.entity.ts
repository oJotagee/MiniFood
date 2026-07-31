import { createHash, randomInt } from 'node:crypto';

import {
  InvalidTwoFactorChallengeError,
  TwoFactorChallengeAlreadyUsedError,
  TwoFactorChallengeExpiredError,
  TwoFactorChallengeTooManyAttemptsError,
} from '../errors/two-factor-challenge.error';

const CODE_TTL_MS = 5 * 60 * 1000;
const MAX_ATTEMPTS = 5;

type TwoFactorChallengeProps = {
  id: string;
  userId: string;
  codeHash: string;
  encryptedRefreshToken: string;
  expiresAt: Date;
  consumedAt?: Date;
  attempts: number;
  createdAt: Date;
};

export type TwoFactorVerifyResult =
  | { outcome: 'valid'; challenge: TwoFactorChallengeEntity }
  | { outcome: 'invalid_code'; challenge: TwoFactorChallengeEntity };

export class TwoFactorChallengeEntity {
  private constructor(private readonly props: TwoFactorChallengeProps) {
    TwoFactorChallengeEntity.validate(props);
  }

  get id(): string {
    return this.props.id;
  }

  get userId(): string {
    return this.props.userId;
  }

  get codeHash(): string {
    return this.props.codeHash;
  }

  get encryptedRefreshToken(): string {
    return this.props.encryptedRefreshToken;
  }

  get expiresAt(): Date {
    return this.props.expiresAt;
  }

  get consumedAt(): Date | undefined {
    return this.props.consumedAt;
  }

  get attempts(): number {
    return this.props.attempts;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  static issue(input: {
    id: string;
    userId: string;
    encryptedRefreshToken: string;
  }): { entity: TwoFactorChallengeEntity; rawCode: string } {
    const rawCode = randomInt(0, 1_000_000).toString().padStart(6, '0');
    const now = new Date();

    const entity = new TwoFactorChallengeEntity({
      id: input.id,
      userId: input.userId,
      codeHash: TwoFactorChallengeEntity.hash(rawCode),
      encryptedRefreshToken: input.encryptedRefreshToken,
      expiresAt: new Date(now.getTime() + CODE_TTL_MS),
      attempts: 0,
      createdAt: now,
    });

    return { entity, rawCode };
  }

  static restore(input: TwoFactorChallengeProps): TwoFactorChallengeEntity {
    return new TwoFactorChallengeEntity({ ...input });
  }

  static hash(rawCode: string): string {
    return createHash('sha256').update(rawCode).digest('hex');
  }

  assertCanAttempt(): void {
    if (this.props.consumedAt) throw new TwoFactorChallengeAlreadyUsedError();
    if (this.props.expiresAt.getTime() < Date.now()) throw new TwoFactorChallengeExpiredError();
    if (this.props.attempts >= MAX_ATTEMPTS) throw new TwoFactorChallengeTooManyAttemptsError();
  }

  verify(rawCode: string): TwoFactorVerifyResult {
    this.assertCanAttempt();

    if (TwoFactorChallengeEntity.hash(rawCode) !== this.props.codeHash) {
      const challenge = new TwoFactorChallengeEntity({
        ...this.props,
        attempts: this.props.attempts + 1,
      });

      return { outcome: 'invalid_code', challenge };
    }

    const challenge = new TwoFactorChallengeEntity({ ...this.props, consumedAt: new Date() });

    return { outcome: 'valid', challenge };
  }

  private static validate(props: TwoFactorChallengeProps): void {
    if (!props.id.trim())
      throw new InvalidTwoFactorChallengeError('Challenge id cannot be empty.');
    if (!props.userId.trim())
      throw new InvalidTwoFactorChallengeError('User id cannot be empty.');
    if (!props.codeHash.trim())
      throw new InvalidTwoFactorChallengeError('Code hash cannot be empty.');
    if (!props.encryptedRefreshToken.trim())
      throw new InvalidTwoFactorChallengeError('Encrypted refresh token cannot be empty.');
  }
}
