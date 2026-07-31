import { TwoFactorChallengeEntity } from '@/domain/entities/two-factor-challenge.entity';

type TwoFactorChallengePersistence = {
  id: string;
  userId: string;
  codeHash: string;
  encryptedRefreshToken: string;
  expiresAt: Date;
  consumedAt: Date | null;
  attempts: number;
  createdAt: Date;
};

export class TwoFactorChallengeMapper {
  static toDomain(raw: TwoFactorChallengePersistence): TwoFactorChallengeEntity {
    return TwoFactorChallengeEntity.restore({
      id: raw.id,
      userId: raw.userId,
      codeHash: raw.codeHash,
      encryptedRefreshToken: raw.encryptedRefreshToken,
      expiresAt: raw.expiresAt,
      consumedAt: raw.consumedAt ?? undefined,
      attempts: raw.attempts,
      createdAt: raw.createdAt,
    });
  }

  static toPersistence(challenge: TwoFactorChallengeEntity) {
    return {
      id: challenge.id,
      userId: challenge.userId,
      codeHash: challenge.codeHash,
      encryptedRefreshToken: challenge.encryptedRefreshToken,
      expiresAt: challenge.expiresAt,
      consumedAt: challenge.consumedAt ?? null,
      attempts: challenge.attempts,
      createdAt: challenge.createdAt,
    };
  }
}
