import { beforeEach, describe, expect, it } from 'bun:test';

import { UpdateEstablishmentUseCase } from '../../../../src/application/use-cases/update-establishment.use-case';
import { CreateEstablishmentUseCase } from '../../../../src/application/use-cases/create-establishment.use-case';
import { InMemoryEstablishmentRepository } from '../../support/in-memory-establishment.repository';
import {
  EstablishmentNotFoundError,
  EstablishmentNotOwnedError,
} from '../../../../src/domain/errors/establishment.error';

const address = {
  street: 'Main St',
  number: '100',
  neighborhood: 'Center',
  city: 'Sao Paulo',
  state: 'SP',
  zipCode: '01000-000',
};

describe('UpdateEstablishmentUseCase', () => {
  let repository: InMemoryEstablishmentRepository;
  let createUseCase: CreateEstablishmentUseCase;
  let updateUseCase: UpdateEstablishmentUseCase;

  beforeEach(() => {
    repository = new InMemoryEstablishmentRepository();
    createUseCase = new CreateEstablishmentUseCase(repository);
    updateUseCase = new UpdateEstablishmentUseCase(repository);
  });

  it('updates the establishment name', async () => {
    const created = await createUseCase.execute({
      name: 'Mini Food',
      ownerId: 'owner-1',
      address,
    });

    const updated = await updateUseCase.execute({
      id: created.id,
      requesterId: 'owner-1',
      name: 'Mini Food Updated',
    });

    expect(updated.name).toBe('Mini Food Updated');
  });

  it('keeps the current description when it is not provided', async () => {
    const created = await createUseCase.execute({
      name: 'Mini Food',
      description: 'Best burgers in town',
      ownerId: 'owner-1',
      address,
    });

    const updated = await updateUseCase.execute({
      id: created.id,
      requesterId: 'owner-1',
      name: 'Mini Food Updated',
    });

    expect(updated.description).toBe('Best burgers in town');
  });

  it('clears the description when explicitly set to null', async () => {
    const created = await createUseCase.execute({
      name: 'Mini Food',
      description: 'Best burgers in town',
      ownerId: 'owner-1',
      address,
    });

    const updated = await updateUseCase.execute({
      id: created.id,
      requesterId: 'owner-1',
      description: null,
    });

    expect(updated.description).toBeUndefined();
  });

  it('replaces the description when a new value is provided', async () => {
    const created = await createUseCase.execute({
      name: 'Mini Food',
      description: 'Best burgers in town',
      ownerId: 'owner-1',
      address,
    });

    const updated = await updateUseCase.execute({
      id: created.id,
      requesterId: 'owner-1',
      description: 'Now with fries',
    });

    expect(updated.description).toBe('Now with fries');
  });

  it('throws when the establishment does not exist', async () => {
    await expect(
      updateUseCase.execute({ id: 'missing-id', requesterId: 'owner-1', name: 'X' }),
    ).rejects.toThrow(EstablishmentNotFoundError);
  });

  it('throws when the requester is not the owner', async () => {
    const created = await createUseCase.execute({
      name: 'Mini Food',
      ownerId: 'owner-1',
      address,
    });

    await expect(
      updateUseCase.execute({
        id: created.id,
        requesterId: 'someone-else',
        name: 'Hijacked',
      }),
    ).rejects.toThrow(EstablishmentNotOwnedError);
  });
});
