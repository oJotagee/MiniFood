import { beforeEach, describe, expect, it } from 'bun:test';

import { SetTwoFactorEnabledUseCase } from '@/application/use-cases/set-two-factor-enabled.use-case';
import { UserEntity } from '@/domain/entities/user.entity';
import { UserNotFoundError } from '@/domain/errors/user.error';
import { Email } from '@/domain/value-objects/email.vo';
import { InMemoryUserRepository } from '../../support/in-memory-user.repository';

describe('SetTwoFactorEnabledUseCase', () => {
  let users: InMemoryUserRepository;
  let useCase: SetTwoFactorEnabledUseCase;

  beforeEach(() => {
    users = new InMemoryUserRepository();
    useCase = new SetTwoFactorEnabledUseCase(users);
  });

  it('enables two-factor for a user', async () => {
    const user = UserEntity.create({
      id: 'user-1',
      name: 'Joao',
      email: Email.create({ value: 'joao@example.com' }),
      role: 'customer',
    });
    await users.create(user);

    const result = await useCase.execute({ id: 'user-1', enabled: true });

    expect(result.twoFactorEnabled).toBe(true);
  });

  it('disables two-factor for a user', async () => {
    const user = UserEntity.create({
      id: 'user-1',
      name: 'Joao',
      email: Email.create({ value: 'joao@example.com' }),
      role: 'customer',
    }).setTwoFactorEnabled(true);
    await users.create(user);

    const result = await useCase.execute({ id: 'user-1', enabled: false });

    expect(result.twoFactorEnabled).toBe(false);
  });

  it('rejects when the user does not exist', async () => {
    await expect(useCase.execute({ id: 'missing', enabled: true })).rejects.toThrow(
      UserNotFoundError,
    );
  });
});
