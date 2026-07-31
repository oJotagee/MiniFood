import { Injectable } from '@nestjs/common';

import { TwoFactorChallengeRepository } from '@/application/port/two-factor-challenge-repository.port';
import { TwoFactorChallengeEntity } from '@/domain/entities/two-factor-challenge.entity';
import { TwoFactorChallengeMapper } from '../persistence/two-factor-challenge.mapper';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TwoFactorChallengePrismaRepository implements TwoFactorChallengeRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findById(id: string): Promise<TwoFactorChallengeEntity | null> {
    const challenge = await this.prismaService.twoFactorChallenge.findUnique({ where: { id } });

    if (!challenge) return null;

    return TwoFactorChallengeMapper.toDomain(challenge);
  }

  async create(challenge: TwoFactorChallengeEntity): Promise<void> {
    const persistence = TwoFactorChallengeMapper.toPersistence(challenge);

    await this.prismaService.twoFactorChallenge.create({ data: persistence });
  }

  async update(challenge: TwoFactorChallengeEntity): Promise<void> {
    const persistence = TwoFactorChallengeMapper.toPersistence(challenge);

    await this.prismaService.twoFactorChallenge.update({
      where: { id: challenge.id },
      data: {
        consumedAt: persistence.consumedAt,
        attempts: persistence.attempts,
      },
    });
  }
}
