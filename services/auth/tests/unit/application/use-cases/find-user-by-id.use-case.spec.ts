import { beforeEach, describe, expect, it } from 'bun:test';

import { FindUserByIdUseCase } from '@/application/use-cases/find-user-by-id.use-case';
import { UserEntity } from '@/domain/entities/user.entity';
import { UserNotFoundError } from '@/domain/errors/user.error';
import { Email } from '@/domain/value-objects/email.vo';
import { InMemoryUserRepository } from '../../support/in-memory-user.repository';

describe('FindUserByIdUseCase', () => {
  let users: InMemoryUserRepository;
  let useCase: FindUserByIdUseCase;

  beforeEach(() => {
    users = new InMemoryUserRepository();
    useCase = new FindUserByIdUseCase(users);
  });

  it('returns the user profile including twoFactorEnabled', async () => {
    const user = UserEntity.create({
      id: 'user-1',
      name: 'Joao',
      email: Email.create({ value: 'joao@example.com' }),
      role: 'customer',
    });
    await users.create(user);

    const result = await useCase.execute({ id: 'user-1' });

    expect(result).toEqual({
      id: 'user-1',
      name: 'Joao',
      email: 'joao@example.com',
      role: 'customer',
      twoFactorEnabled: false,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  });

  it('rejects when the user does not exist', async () => {
    await expect(useCase.execute({ id: 'missing' })).rejects.toThrow(UserNotFoundError);
  });
});
