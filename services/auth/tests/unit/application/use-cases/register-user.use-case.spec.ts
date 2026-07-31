import { beforeEach, describe, expect, it } from 'bun:test';

import { RegisterUserUseCase } from '@/application/use-cases/register-user.use-case';
import { InMemoryUserRepository } from '../../support/in-memory-user.repository';
import { FakeIdentityProvider } from '../../support/fake-identity-provider';
import { UserAlreadyExistsError } from '@/domain/errors/user.error';

describe('RegisterUserUseCase', () => {
  let users: InMemoryUserRepository;
  let identityProvider: FakeIdentityProvider;
  let useCase: RegisterUserUseCase;

  beforeEach(() => {
    users = new InMemoryUserRepository();
    identityProvider = new FakeIdentityProvider();
    useCase = new RegisterUserUseCase(users, identityProvider);
  });

  it('registers on the identity provider first, then persists the local profile', async () => {
    const result = await useCase.execute({
      name: 'Joao',
      email: 'joao@example.com',
      password: 'senha-forte-123',
      role: 'customer',
    });

    expect(identityProvider.registerCalls).toEqual([
      {
        email: 'joao@example.com',
        password: 'senha-forte-123',
        name: 'Joao',
        role: 'customer',
      },
    ]);
    expect(result.id).toBe('keycloak-joao@example.com');
    expect(result.twoFactorEnabled).toBe(false);

    const persisted = await users.findById(result.id);
    expect(persisted).not.toBeNull();
  });

  it('rejects when a user with the same email already exists locally', async () => {
    await useCase.execute({
      name: 'Joao',
      email: 'joao@example.com',
      password: 'senha-forte-123',
      role: 'customer',
    });

    await expect(
      useCase.execute({
        name: 'Joao 2',
        email: 'joao@example.com',
        password: 'outra-senha-123',
        role: 'customer',
      }),
    ).rejects.toThrow(UserAlreadyExistsError);

    expect(identityProvider.registerCalls).toHaveLength(1);
  });
});
