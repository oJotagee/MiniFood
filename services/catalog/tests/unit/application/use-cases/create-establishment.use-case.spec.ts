import { beforeEach, describe, expect, it } from 'bun:test';

import { CreateEstablishmentUseCase } from '../../../../src/application/use-cases/create-establishment.use-case';
import { InMemoryEstablishmentRepository } from '../../support/in-memory-establishment.repository';

const address = {
  street: 'Main St',
  number: '100',
  neighborhood: 'Center',
  city: 'Sao Paulo',
  state: 'SP',
  zipCode: '01000-000',
};

describe('CreateEstablishmentUseCase', () => {
  let repository: InMemoryEstablishmentRepository;
  let createUseCase: CreateEstablishmentUseCase;

  beforeEach(() => {
    repository = new InMemoryEstablishmentRepository();
    createUseCase = new CreateEstablishmentUseCase(repository);
  });

  it('creates and persists an establishment', async () => {
    const created = await createUseCase.execute({
      name: 'Mini Food',
      ownerId: 'owner-1',
      address,
    });

    const persisted = await repository.findById(created.id);

    expect(persisted).not.toBeNull();
    expect(persisted?.name).toBe('Mini Food');
    expect(persisted?.ownerId).toBe('owner-1');
  });

  it('treats a null description as no description', async () => {
    const created = await createUseCase.execute({
      name: 'Mini Food',
      description: null,
      ownerId: 'owner-1',
      address,
    });

    expect(created.description).toBeUndefined();
  });
});
