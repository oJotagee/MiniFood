import { beforeEach, describe, expect, it } from 'bun:test';

import { FindAllEstablishmentsUseCase } from '@/application/use-cases/establishment/find-all-establishments.use-case';
import { CreateEstablishmentUseCase } from '@/application/use-cases/establishment/create-establishment.use-case';
import { InMemoryEstablishmentRepository } from '@tests/unit/support/in-memory-establishment.repository';

const address = {
  street: 'Main St',
  number: '100',
  neighborhood: 'Center',
  city: 'Sao Paulo',
  state: 'SP',
  zipCode: '01000-000',
};

describe('FindAllEstablishmentsUseCase', () => {
  let repository: InMemoryEstablishmentRepository;
  let createUseCase: CreateEstablishmentUseCase;
  let findAllUseCase: FindAllEstablishmentsUseCase;

  beforeEach(async () => {
    repository = new InMemoryEstablishmentRepository();
    createUseCase = new CreateEstablishmentUseCase(repository);
    findAllUseCase = new FindAllEstablishmentsUseCase(repository);

    for (let i = 0; i < 15; i++) {
      await createUseCase.execute({
        name: `Establishment ${i}`,
        ownerId: 'owner-1',
        address,
      });
    }
  });

  it('applies default pagination when none is provided', async () => {
    const result = await findAllUseCase.execute({ ownerId: 'owner-1' });

    expect(result.list).toHaveLength(10);
    expect(result.pagination).toEqual({
      page: 1,
      perPage: 10,
      total: 15,
      totalPages: 2,
    });
  });

  it('falls back to the default limit when limit is zero or negative', async () => {
    const zero = await findAllUseCase.execute({ ownerId: 'owner-1', limit: 0 });
    const negative = await findAllUseCase.execute({ ownerId: 'owner-1', limit: -5 });

    expect(zero.pagination.perPage).toBe(10);
    expect(negative.pagination.perPage).toBe(10);
  });

  it('falls back to offset zero when offset is negative', async () => {
    const result = await findAllUseCase.execute({ ownerId: 'owner-1', offset: -20 });

    expect(result.list).toHaveLength(10);
    expect(result.pagination.page).toBe(1);
  });

  it('caps the limit to avoid unbounded page sizes', async () => {
    const result = await findAllUseCase.execute({ ownerId: 'owner-1', limit: 10000 });

    expect(result.pagination.perPage).toBe(100);
  });

  it('ignores non-integer limit and offset values', async () => {
    const result = await findAllUseCase.execute({
      ownerId: 'owner-1',
      limit: 2.5,
      offset: 1.5,
    });

    expect(result.pagination.perPage).toBe(10);
    expect(result.pagination.page).toBe(1);
  });
});
