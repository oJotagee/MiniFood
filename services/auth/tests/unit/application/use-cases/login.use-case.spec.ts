import { beforeEach, describe, expect, it } from 'bun:test';

import { InMemoryTwoFactorChallengeRepository } from '../../support/in-memory-two-factor-challenge.repository';
import { InMemoryUserRepository } from '../../support/in-memory-user.repository';
import { FakeIdentityProvider } from '../../support/fake-identity-provider';
import { FakeSecretGenerator } from '../../support/fake-secret-generator';
import { LoginUseCase } from '@/application/use-cases/login.use-case';
import { TokenCipher } from '@/infrastructure/security/token-cipher';
import { FakeEmailSender } from '../../support/fake-email-sender';
import { UserNotFoundError } from '@/domain/errors/user.error';
import { UserEntity } from '@/domain/entities/user.entity';
import { Email } from '@/domain/value-objects/email.vo';

describe('LoginUseCase', () => {
  let users: InMemoryUserRepository;
  let challenges: InMemoryTwoFactorChallengeRepository;
  let identityProvider: FakeIdentityProvider;
  let emailSender: FakeEmailSender;
  let useCase: LoginUseCase;

  beforeEach(() => {
    users = new InMemoryUserRepository();
    challenges = new InMemoryTwoFactorChallengeRepository();
    identityProvider = new FakeIdentityProvider();
    emailSender = new FakeEmailSender();
    useCase = new LoginUseCase(
      identityProvider,
      users,
      challenges,
      emailSender,
      new FakeSecretGenerator(),
      new TokenCipher(),
    );
  });

  it('returns tokens directly when the user does not have two-factor enabled', async () => {
    const user = UserEntity.create({
      id: 'user-1',
      name: 'Joao',
      email: Email.create({ value: 'joao@example.com' }),
      role: 'customer',
    });
    await users.create(user);

    const result = await useCase.execute({ email: 'joao@example.com', password: 'senha-123' });

    expect(result).toEqual({
      requiresTwoFactor: false,
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      expiresIn: 300,
    });
    expect(emailSender.twoFactorEmails).toHaveLength(0);
  });

  it('issues a challenge and sends a code by email when two-factor is enabled', async () => {
    const user = UserEntity.create({
      id: 'user-1',
      name: 'Joao',
      email: Email.create({ value: 'joao@example.com' }),
      role: 'customer',
    }).setTwoFactorEnabled(true);
    await users.create(user);

    const result = await useCase.execute({ email: 'joao@example.com', password: 'senha-123' });

    expect(result.requiresTwoFactor).toBe(true);
    if (!result.requiresTwoFactor) throw new Error('expected requiresTwoFactor');

    expect(emailSender.twoFactorEmails).toHaveLength(1);
    expect(emailSender.twoFactorEmails[0]?.to).toBe('joao@example.com');

    const persistedChallenge = await challenges.findById(result.challengeId);
    expect(persistedChallenge).not.toBeNull();
  });

  it('throws when the identity provider validates the password but no local profile exists', async () => {
    await expect(
      useCase.execute({ email: 'ghost@example.com', password: 'senha-123' }),
    ).rejects.toThrow(UserNotFoundError);
  });
});
