import { createHash } from 'node:crypto';
import { beforeEach, describe, expect, it } from 'bun:test';

import { InMemoryPasswordResetTokenRepository } from '../../support/in-memory-password-reset-token.repository';
import { ResetPasswordRequestUseCase } from '@/application/use-cases/reset-password-request.use-case';
import { InMemoryUserRepository } from '../../support/in-memory-user.repository';
import { FakeEmailSender } from '../../support/fake-email-sender';
import { UserEntity } from '@/domain/entities/user.entity';
import { Email } from '@/domain/value-objects/email.vo';

describe('ResetPasswordRequestUseCase', () => {
  let users: InMemoryUserRepository;
  let resetTokens: InMemoryPasswordResetTokenRepository;
  let emailSender: FakeEmailSender;
  let useCase: ResetPasswordRequestUseCase;

  beforeEach(() => {
    users = new InMemoryUserRepository();
    resetTokens = new InMemoryPasswordResetTokenRepository();
    emailSender = new FakeEmailSender();
    useCase = new ResetPasswordRequestUseCase(users, resetTokens, emailSender);
  });

  it('creates a token and sends the reset email when the user exists', async () => {
    const user = UserEntity.create({
      id: 'user-1',
      name: 'Joao',
      email: Email.create({ value: 'joao@example.com' }),
      role: 'customer',
    });
    await users.create(user);

    await useCase.execute({ email: 'joao@example.com' });

    expect(emailSender.passwordResetEmails).toHaveLength(1);
    expect(emailSender.passwordResetEmails[0]?.to).toBe('joao@example.com');

    const token = await resetTokens.findByTokenHash(
      require('crypto')
        .createHash('sha256')
        .update(emailSender.passwordResetEmails[0]!.resetToken)
        .digest('hex'),
    );
    expect(token).not.toBeNull();
  });

  it('does not send an email or create a token when the user does not exist (avoids enumeration)', async () => {
    await useCase.execute({ email: 'ghost@example.com' });

    expect(emailSender.passwordResetEmails).toHaveLength(0);
  });
});
