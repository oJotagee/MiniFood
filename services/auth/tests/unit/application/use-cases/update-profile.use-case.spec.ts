import { beforeEach, describe, expect, it } from 'bun:test';

import { UpdateProfileUseCase } from '@/application/use-cases/update-profile.use-case';
import { UserEntity } from '@/domain/entities/user.entity';
import { UserAlreadyExistsError, UserNotFoundError } from '@/domain/errors/user.error';
import { Email } from '@/domain/value-objects/email.vo';
import { InMemoryUserRepository } from '../../support/in-memory-user.repository';

describe('UpdateProfileUseCase', () => {
  let users: InMemoryUserRepository;
  let useCase: UpdateProfileUseCase;

  beforeEach(() => {
    users = new InMemoryUserRepository();
    useCase = new UpdateProfileUseCase(users);
  });

  it('updates the name', async () => {
    const user = UserEntity.create({
      id: 'user-1',
      name: 'Joao',
      email: Email.create({ value: 'joao@example.com' }),
      role: 'customer',
    });
    await users.create(user);

    const result = await useCase.execute({ id: 'user-1', name: 'Joao Silva' });

    expect(result.name).toBe('Joao Silva');
    expect(result.email).toBe('joao@example.com');
  });

  it('updates the email when it is not taken', async () => {
    const user = UserEntity.create({
      id: 'user-1',
      name: 'Joao',
      email: Email.create({ value: 'joao@example.com' }),
      role: 'customer',
    });
    await users.create(user);

    const result = await useCase.execute({ id: 'user-1', email: 'joao.silva@example.com' });

    expect(result.email).toBe('joao.silva@example.com');
  });

  it('allows keeping the same email unchanged', async () => {
    const user = UserEntity.create({
      id: 'user-1',
      name: 'Joao',
      email: Email.create({ value: 'joao@example.com' }),
      role: 'customer',
    });
    await users.create(user);

    const result = await useCase.execute({ id: 'user-1', email: 'joao@example.com' });

    expect(result.email).toBe('joao@example.com');
  });

  it('rejects when the new email is already taken by another user', async () => {
    await users.create(
      UserEntity.create({
        id: 'user-1',
        name: 'Joao',
        email: Email.create({ value: 'joao@example.com' }),
        role: 'customer',
      }),
    );
    await users.create(
      UserEntity.create({
        id: 'user-2',
        name: 'Maria',
        email: Email.create({ value: 'maria@example.com' }),
        role: 'customer',
      }),
    );

    await expect(
      useCase.execute({ id: 'user-2', email: 'joao@example.com' }),
    ).rejects.toThrow(UserAlreadyExistsError);
  });

  it('rejects when the user does not exist', async () => {
    await expect(useCase.execute({ id: 'missing', name: 'X' })).rejects.toThrow(
      UserNotFoundError,
    );
  });
});
