import { beforeEach, describe, expect, it } from 'bun:test';

import { FindEstablishmentByIdUseCase } from '@/application/use-cases/establishment/find-establishment-by-id.use-case';
import { CreateEstablishmentUseCase } from '@/application/use-cases/establishment/create-establishment.use-case';
import { InMemoryEstablishmentRepository } from '@tests/unit/support/in-memory-establishment.repository';
import {
  EstablishmentNotFoundError,
  EstablishmentNotOwnedError,
} from '@/domain/errors/establishment.error';

const address = {
  street: 'Main St',
  number: '100',
  neighborhood: 'Center',
  city: 'Sao Paulo',
  state: 'SP',
  zipCode: '01000-000',
};

describe('FindEstablishmentByIdUseCase', () => {
  let repository: InMemoryEstablishmentRepository;
  let createUseCase: CreateEstablishmentUseCase;
  let findByIdUseCase: FindEstablishmentByIdUseCase;

  beforeEach(() => {
    repository = new InMemoryEstablishmentRepository();
    createUseCase = new CreateEstablishmentUseCase(repository);
    findByIdUseCase = new FindEstablishmentByIdUseCase(repository);
  });

  it('returns the establishment when it exists', async () => {
    const created = await createUseCase.execute({
      name: 'Mini Food',
      ownerId: 'owner-1',
      address,
    });

    const found = await findByIdUseCase.execute({ id: created.id, requesterId: 'owner-1' });

    expect(found.id).toBe(created.id);
    expect(found.name).toBe('Mini Food');
  });

  it('throws when the establishment does not exist', async () => {
    await expect(
      findByIdUseCase.execute({ id: 'missing-id', requesterId: 'owner-1' }),
    ).rejects.toThrow(EstablishmentNotFoundError);
  });

  it('throws when the requester does not own the establishment', async () => {
    const created = await createUseCase.execute({
      name: 'Mini Food',
      ownerId: 'owner-1',
      address,
    });

    await expect(
      findByIdUseCase.execute({ id: created.id, requesterId: 'someone-else' }),
    ).rejects.toThrow(EstablishmentNotOwnedError);
  });
});
