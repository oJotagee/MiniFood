import { Inject, Injectable } from '@nestjs/common';

import type { PasswordResetTokenRepository } from '../port/password-reset-token-repository.port';
import { PASSWORD_RESET_TOKEN_REPOSITORY } from '../port/password-reset-token-repository.port';
import { PasswordResetTokenEntity } from '@/domain/entities/password-reset-token.entity';
import type { UserRepository } from '../port/user-repository.port';
import { USER_REPOSITORY } from '../port/user-repository.port';
import type { EmailSender } from '../port/email-sender.port';
import { EMAIL_SENDER } from '../port/email-sender.port';
import { Email } from '@/domain/value-objects/email.vo';

@Injectable()
export class ResetPasswordRequestUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly users: UserRepository,

    @Inject(PASSWORD_RESET_TOKEN_REPOSITORY)
    private readonly resetTokens: PasswordResetTokenRepository,

    @Inject(EMAIL_SENDER)
    private readonly emailSender: EmailSender,
  ) { }

  async execute({ email }: { email: string }): Promise<void> {
    const validEmail = Email.create({ value: email });

    const user = await this.users.findByEmail(validEmail.toString());
    if (!user) return;

    const { entity, rawToken } = PasswordResetTokenEntity.issue({
      id: crypto.randomUUID(),
      userId: user.id,
    });

    await this.resetTokens.create(entity);

    await this.emailSender.sendPasswordResetEmail({
      to: user.email.toString(),
      name: user.name,
      resetToken: rawToken,
    });
  }
}
