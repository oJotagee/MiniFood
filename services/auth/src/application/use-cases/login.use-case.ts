import { Inject, Injectable } from '@nestjs/common';

import type { TwoFactorChallengeRepository } from '../port/two-factor-challenge-repository.port';
import { TWO_FACTOR_CHALLENGE_REPOSITORY } from '../port/two-factor-challenge-repository.port';
import { TwoFactorChallengeEntity } from '@/domain/entities/two-factor-challenge.entity';
import type { IdentityProvider, IdentityTokens } from '../port/identity-provider.port';
import { TokenCipher } from '@/infrastructure/security/token-cipher';
import { IDENTITY_PROVIDER } from '../port/identity-provider.port';
import type { UserRepository } from '../port/user-repository.port';
import { USER_REPOSITORY } from '../port/user-repository.port';
import { UserNotFoundError } from '@/domain/errors/user.error';
import type { EmailSender } from '../port/email-sender.port';
import { EMAIL_SENDER } from '../port/email-sender.port';

type LoginInput = {
  email: string;
  password: string;
};

export type LoginOutput =
  | ({ requiresTwoFactor: false } & IdentityTokens)
  | { requiresTwoFactor: true; challengeId: string };

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(IDENTITY_PROVIDER)
    private readonly identityProvider: IdentityProvider,
    @Inject(USER_REPOSITORY)
    private readonly users: UserRepository,
    @Inject(TWO_FACTOR_CHALLENGE_REPOSITORY)
    private readonly challenges: TwoFactorChallengeRepository,
    @Inject(EMAIL_SENDER)
    private readonly emailSender: EmailSender,
    private readonly tokenCipher: TokenCipher,
  ) { }

  async execute(input: LoginInput): Promise<LoginOutput> {
    const tokens = await this.identityProvider.login(input.email, input.password);

    const user = await this.users.findByEmail(input.email);
    if (!user) throw new UserNotFoundError(input.email);

    if (!user.twoFactorEnabled) {
      return { requiresTwoFactor: false, ...tokens };
    }

    const { entity, rawCode } = TwoFactorChallengeEntity.issue({
      id: crypto.randomUUID(),
      userId: user.id,
      encryptedRefreshToken: this.tokenCipher.encrypt(tokens.refreshToken),
    });

    await this.challenges.create(entity);

    await this.emailSender.sendTwoFactorCode({
      to: user.email.toString(),
      name: user.name,
      code: rawCode,
    });

    return { requiresTwoFactor: true, challengeId: entity.id };
  }
}
