import { beforeEach, describe, expect, it } from 'bun:test';

import { FindEstablishmentByIdUseCase } from '../../../../src/application/use-cases/establishment/find-establishment-by-id.use-case';
import { CreateEstablishmentUseCase } from '../../../../src/application/use-cases/establishment/create-establishment.use-case';
import { InMemoryEstablishmentRepository } from '../../support/in-memory-establishment.repository';
import { EstablishmentNotFoundError } from '../../../../src/domain/errors/establishment.error';

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

    const found = await findByIdUseCase.execute({ id: created.id });

    expect(found.id).toBe(created.id);
    expect(found.name).toBe('Mini Food');
  });

  it('throws when the establishment does not exist', async () => {
    await expect(findByIdUseCase.execute({ id: 'missing-id' })).rejects.toThrow(
      EstablishmentNotFoundError,
    );
  });
});
