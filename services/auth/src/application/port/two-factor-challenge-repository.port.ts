import { TwoFactorChallengeEntity } from '@/domain/entities/two-factor-challenge.entity';

export const TWO_FACTOR_CHALLENGE_REPOSITORY = Symbol('TWO_FACTOR_CHALLENGE_REPOSITORY');

export interface TwoFactorChallengeRepository {
  findById(id: string): Promise<TwoFactorChallengeEntity | null>;
  create(challenge: TwoFactorChallengeEntity): Promise<void>;
  update(challenge: TwoFactorChallengeEntity): Promise<void>;
}
