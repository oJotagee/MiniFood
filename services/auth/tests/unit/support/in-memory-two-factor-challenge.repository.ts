import type { TwoFactorChallengeRepository } from '@/application/port/two-factor-challenge-repository.port';
import { TwoFactorChallengeEntity } from '@/domain/entities/two-factor-challenge.entity';

export class InMemoryTwoFactorChallengeRepository implements TwoFactorChallengeRepository {
  private readonly challenges = new Map<string, TwoFactorChallengeEntity>();

  async findById(id: string): Promise<TwoFactorChallengeEntity | null> {
    return this.challenges.get(id) ?? null;
  }

  async create(challenge: TwoFactorChallengeEntity): Promise<void> {
    this.challenges.set(challenge.id, challenge);
  }

  async update(challenge: TwoFactorChallengeEntity): Promise<void> {
    this.challenges.set(challenge.id, challenge);
  }
}
